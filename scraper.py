import requests
from bs4 import BeautifulSoup
import re
import json
import urllib.parse
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "https://www.cyclo-blanmont.be/"
years_pages = {
    "2026": "galeries.htm",
    "2025": "galeries25.htm",
    "2024": "galeries24.htm",
    "2023": "galeries23.htm",
    "2022": "galeries22.htm",
    "2021": "galeries21.htm",
    "2020": "galeries20.htm",
    "2019": "galeries19.htm",
}

def get_google_photos_images(album_url):
    try:
        r = requests.get(album_url, timeout=10)
        r.raise_for_status()
        html = r.text
        # Look for the internal representation of the image URLs
        # Often it starts with https://lh3.googleusercontent.com/pw/
        urls = re.findall(r'(https://lh3\.googleusercontent\.com/pw/[a-zA-Z0-9\-_]+)', html)
        if not urls:
             urls = re.findall(r'(https://lh3\.googleusercontent\.com/[a-zA-Z0-9\-_]+)', html)

        # Filter duplicates but keep insertion order if possible, though sets destroy order
        urls = list(set(urls))

        # Filter out generic UI elements if needed, but pw/ usually implies actual photos
        return urls
    except Exception as e:
        print(f"Error fetching Google Photos album {album_url}: {e}")
        return []

def scrape_page(year, page):
    url = urllib.parse.urljoin(BASE_URL, page)
    print(f"Scraping {year} from {url}...")
    try:
        r = requests.get(url, timeout=10)
        r.encoding = 'windows-1252' # The site uses this encoding
        html = r.text
    except requests.RequestException as e:
        print(f"Failed to fetch {url}: {e}")
        return []

    soup = BeautifulSoup(html, 'html.parser')
    albums = []

    for a in soup.find_all('a', href=True):
        href = a['href']

        if 'photos.app.goo.gl' in href or 'picasaweb.google.com' in href or 'plus.google.com' in href:
            title = ""

            parent_td = a.find_parent('td')
            if parent_td:
                row = parent_td.find_parent('tr')
                if row:
                    tds = row.find_all('td')
                    for i, td in enumerate(tds):
                        if td == parent_td and i + 1 < len(tds):
                            title = tds[i+1].get_text(separator=' ', strip=True)
                            break

            if not title:
                title = a.get_text(separator=' ', strip=True)

            albums.append({
                "year": year,
                "title": title,
                "url": href,
                "images": []
            })

    return albums

all_albums = []
for year, page in years_pages.items():
    albums = scrape_page(year, page)
    all_albums.extend(albums)

# Clean titles and remove duplicates by URL
seen_urls = set()
unique_albums = []
for album in all_albums:
    # Clean up empty or garbage titles
    if not album['title']:
        album['title'] = "Sans titre"

    # Remove weird characters like non-breaking spaces or double spaces
    album['title'] = " ".join(album['title'].split())

    if album['url'] not in seen_urls:
        seen_urls.add(album['url'])
        unique_albums.append(album)

print(f"Found {len(unique_albums)} unique albums total. Extracting images...")

def fetch_images_for_album(album):
    #print(f"Fetching images for {album['title']} ({album['url']})")
    album['images'] = get_google_photos_images(album['url'])
    return album

with ThreadPoolExecutor(max_workers=5) as executor:
    final_albums = list(executor.map(fetch_images_for_album, unique_albums))

with open('scraped_albums.json', 'w', encoding='utf-8') as f:
    json.dump(final_albums, f, indent=4, ensure_ascii=False)

print("Done! Saved to scraped_albums.json")
