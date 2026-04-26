import React from 'react';
import './GamificationProgress.css';

const GamificationProgress = ({ stats }) => {
    if (!stats) return null;

    const {
        points = 0,
        level = 1,
        currentLevelInfo = {},
        nextLevelInfo = null,
        progressToNextLevel = 0,
        currentStreak = 0,
        longestStreak = 0,
        badgeCount = 0,
        totalBadges = 0
    } = stats;

    return (
        <div className="gamification-progress">
            {/* Level and Points */}
            <div className="gamification-header">
                <div className="level-badge">
                    <div className="level-icon">⭐</div>
                    <div className="level-info">
                        <span className="level-label">Nível</span>
                        <span className="level-number">{level}</span>
                    </div>
                </div>

                <div className="level-title">
                    <h3>{currentLevelInfo.title || 'Iniciante Financeiro'}</h3>
                    <div className="points-display">
                        <span className="points-icon">💎</span>
                        <span className="points-value">{points.toLocaleString('pt-BR')}</span>
                        <span className="points-label">pontos</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {nextLevelInfo && (
                <div className="level-progress-section">
                    <div className="progress-header">
                        <span className="progress-label">
                            Progresso para Nível {nextLevelInfo.level}
                        </span>
                        <span className="progress-percentage">
                            {Math.round(progressToNextLevel)}%
                        </span>
                    </div>
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progressToNextLevel}%` }}
                        >
                            <div className="progress-bar-shine"></div>
                        </div>
                    </div>
                    <div className="progress-footer">
                        <span className="next-level-title">{nextLevelInfo.title}</span>
                        <span className="points-needed">
                            {(nextLevelInfo.minPoints - points).toLocaleString('pt-BR')} pontos restantes
                        </span>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="gamification-stats-grid">
                {/* Streak */}
                <div className="stat-card streak-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-content">
                        <div className="stat-value">{currentStreak}</div>
                        <div className="stat-label">Dias Consecutivos</div>
                        {longestStreak > currentStreak && (
                            <div className="stat-sub">Recorde: {longestStreak}</div>
                        )}
                    </div>
                </div>

                {/* Badges */}
                <div className="stat-card badges-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-content">
                        <div className="stat-value">{badgeCount}/{totalBadges}</div>
                        <div className="stat-label">Conquistas</div>
                        <div className="stat-sub">
                            {Math.round((badgeCount / totalBadges) * 100)}% completo
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamificationProgress;
