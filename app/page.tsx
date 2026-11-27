import React from 'react';
import {
  getBlogPosts,
  getActiveWeekendPoll,
  getCalendarEvents,
  getHeroSettings,
  getPollResponses,
  getLeaderboardEntries,
  getAllAttendance,
  getPhotoAlbums,
} from './lib/firebase';
import { getNextScheduledRide } from './lib/firebase/calendar';
import { getRideWeather } from './lib/weather';
import { calculateLeaderboardFromAttendance, getPossibleCarresCount } from './lib/carreVert';
import HomeCover from './components/home/HomeCover';
import HomeSlider from './components/home/HomeSlider';
import WeekendBoard from './components/home/WeekendBoard';
import GroupRoads from './components/home/GroupRoads';
import SeasonTimetable from './components/home/SeasonTimetable';
import CarreVertBand from './components/home/CarreVertBand';
import PhotoPlates from './components/home/PhotoPlates';
import JoinRoute from './components/home/JoinRoute';
import HomeBlogSection from './components/shared/HomeBlogSection';
import { tallyPoll, upcomingEvents, localTodayIso } from './components/home/homeData';
import { getSessionUser } from './lib/auth/session';
import { withMemberTraceLinks } from './lib/member-trace';
import { getCachedGroupSettings } from './lib/firebase/group-settings';
import { groupSummaryText } from './lib/groupSummary';
import { weekendSchedule } from './lib/weekendSchedule';

/**
 * Home — La Feuille de Blanmont: the next departure printed as the title of the
 * club's own topographic sheet, the club's photo slider, then the groups as the
 * map legend, the season timetable, the weekend survey, the Carré Vert, the photo
 * plates and the logbook.
 */
export default async function Home(): Promise<React.ReactElement> {
  const [posts, activePoll, rawEvents, heroSettings, albums, rawEntries, allAttendance, sessionUser] =
    await Promise.all([
      getBlogPosts(),
      getActiveWeekendPoll(),
      getCalendarEvents(),
      getHeroSettings(),
      getPhotoAlbums(),
      getLeaderboardEntries(),
      getAllAttendance(),
      getSessionUser(),
    ]);

  const isMember = Boolean(sessionUser);
  // Traces are for members: the page only carries their member links (#252).
  const events = withMemberTraceLinks(rawEvents);
  const nextRide = getNextScheduledRide(events);
  const [weather, responses] = await Promise.all([
    getRideWeather(nextRide.isoDate, nextRide.departure).catch(() => null),
    activePoll ? getPollResponses(activePoll.id) : Promise.resolve([]),
  ]);

  // Saturday calendar time only when the next ride is a Saturday event (summer 8h00 / 8h30).
  const nextIsSaturday = new Date(`${nextRide.isoDate}T12:00:00`).getDay() === 6;
  const schedule = weekendSchedule(
    new Date(),
    nextRide.isCustomEvent && nextIsSaturday ? nextRide.departure : undefined
  );
  const groupNames = groupSummaryText(await getCachedGroupSettings());
  const tally = tallyPoll(responses);
  const today = localTodayIso();
  const year = Number(today.slice(0, 4));
  const upcoming = upcomingEvents(events, today, 6);
  const seasonTotal = events.filter((e) => e.isoDate?.startsWith(String(year))).length;

  const possible = getPossibleCarresCount(events, year, {
    includeOnlyPastOrAttended: true,
    allAttendance,
  });
  const riders = calculateLeaderboardFromAttendance(rawEntries, events, allAttendance, year)
    .filter((entry) => entry.rides > 0)
    .slice(0, 8)
    .map((entry) => ({ id: entry.id, name: entry.name, group: entry.group, rides: entry.rides }));

  const photoTotal = albums.reduce((sum, album) => sum + (album.photoCount || 0), 0);

  return (
    <div className="bg-paper text-ink transition-colors duration-200 dark:bg-night dark:text-snow">
      <HomeCover
        nextRide={nextRide}
        weather={weather}
        heroSettings={heroSettings}
        schedule={schedule}
        groupNames={groupNames}
        activePoll={activePoll}
        ridersAnnounced={tally.riders}
      />
      <HomeSlider heroSettings={heroSettings} />
      <GroupRoads />
      <SeasonTimetable events={upcoming} totalThisSeason={seasonTotal} />
      <WeekendBoard poll={activePoll} tally={tally} />
      <CarreVertBand year={year} possible={possible} riders={riders} isAuthenticated={isMember} />
      <PhotoPlates
        albums={albums}
        slides={heroSettings.slides}
        albumCount={albums.length}
        photoCount={photoTotal}
      />
      <HomeBlogSection posts={posts} />
      <JoinRoute />
    </div>
  );
}
