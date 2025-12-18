import { getMembers } from '../lib/notion';
import styles from './page.module.css';

export const revalidate = 60; // ISR every 60 seconds

export default async function MembersPage() {
    const members = await getMembers();

    return (
        <div className="container">
            <header className={styles.header}>
                <h1 className={styles.title}>The Peleton</h1>
                <p className={styles.subtitle}>Meet the riders powering Blanmont.</p>
            </header>

            <div className={styles.grid}>
                {members.map((member) => (
                    <div key={member.id} className={styles.card}>
                        <div
                            className={styles.image}
                            style={{ backgroundImage: `url(${member.photoUrl})` }}
                        />
                        <div className={styles.content}>
                            <div className={styles.roleContainer}>
                                {member.role.map(r => (
                                    <span key={r} className={styles.role}>{r}</span>
                                ))}
                            </div>
                            <h3 className={styles.name}>{member.name}</h3>
                            <p className={styles.bio}>{member.bio}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
