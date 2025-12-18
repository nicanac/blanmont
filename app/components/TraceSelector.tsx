'use client';

import { Trace } from '../types';
import styles from './TraceSelector.module.css';

interface Props {
    traces: Trace[];
    selectedIds: string[];
    onToggle: (id: string) => void;
}

export default function TraceSelector({ traces, selectedIds, onToggle }: Props) {
    return (
        <div className={styles.container}>
            <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                {traces.length} traces available
            </div>
            <div className={styles.grid}>
                {traces.map(trace => {
                    const isSelected = selectedIds.includes(trace.id);
                    return (
                        <div
                            key={trace.id}
                            className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                            onClick={() => onToggle(trace.id)}
                        >
                            <div className={styles.header}>
                                <span className={styles.name}>{trace.name}</span>
                                {isSelected && <span className={styles.check}>✓</span>}
                            </div>
                            <div className={styles.meta}>
                                <span>{trace.distance}km</span>
                                <span>{trace.elevation}m</span>
                                <span>{trace.surface}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
