import React, { useState } from 'react';
import './BadgesDisplay.css';

const BadgesDisplay = ({ earnedBadges = [], lockedBadges = [] }) => {
    const [filter, setFilter] = useState('all'); // 'all', 'earned', 'locked'
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = ['all', 'transaction', 'streak', 'financial', 'achievement'];
    const categoryLabels = {
        all: 'Todas',
        transaction: 'Transações',
        streak: 'Sequência',
        financial: 'Financeiro',
        achievement: 'Conquistas'
    };

    const filterBadges = (badges, isEarned) => {
        let filtered = badges;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(b =>
                (isEarned ? b.Badge?.category : b.category) === selectedCategory
            );
        }

        return filtered;
    };

    const displayedEarned = filterBadges(earnedBadges, true);
    const displayedLocked = filterBadges(lockedBadges, false);

    const getRarityClass = (rarity) => {
        return `rarity-${rarity || 'common'}`;
    };

    return (
        <div className="badges-display">
            <div className="badges-header">
                <h2>🏆 Conquistas</h2>
                <div className="badges-stats">
                    <span className="badge-count">
                        {earnedBadges.length}/{earnedBadges.length + lockedBadges.length}
                    </span>
                    <span className="badge-percentage">
                        {Math.round((earnedBadges.length / (earnedBadges.length + lockedBadges.length)) * 100)}%
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="badges-filters">
                <div className="filter-group">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Todas
                    </button>
                    <button
                        className={`filter-btn ${filter === 'earned' ? 'active' : ''}`}
                        onClick={() => setFilter('earned')}
                    >
                        Desbloqueadas ({earnedBadges.length})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'locked' ? 'active' : ''}`}
                        onClick={() => setFilter('locked')}
                    >
                        Bloqueadas ({lockedBadges.length})
                    </button>
                </div>

                <div className="category-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {categoryLabels[cat]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Badges Grid */}
            <div className="badges-grid">
                {/* Earned Badges */}
                {(filter === 'all' || filter === 'earned') && displayedEarned.map((userBadge, index) => {
                    const badge = userBadge.Badge || userBadge;
                    return (
                        <div
                            key={`earned-${badge.id || index}`}
                            className={`badge-card earned ${getRarityClass(badge.rarity)}`}
                        >
                            {userBadge.isNew && <div className="badge-new-indicator">NOVO!</div>}
                            <div className="badge-icon-wrapper">
                                <div className="badge-glow"></div>
                                <div className="badge-icon">{badge.icon || '🏆'}</div>
                            </div>
                            <div className="badge-info">
                                <h4 className="badge-name">{badge.description}</h4>
                                <div className="badge-meta">
                                    <span className={`badge-rarity ${getRarityClass(badge.rarity)}`}>
                                        {badge.rarity?.toUpperCase() || 'COMUM'}
                                    </span>
                                    <span className="badge-points">+{badge.points} pts</span>
                                </div>
                                {userBadge.earnedAt && (
                                    <div className="badge-earned-date">
                                        Desbloqueado em {new Date(userBadge.earnedAt).toLocaleDateString('pt-BR')}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Locked Badges */}
                {(filter === 'all' || filter === 'locked') && displayedLocked.map((badge, index) => (
                    <div
                        key={`locked-${badge.id || index}`}
                        className="badge-card locked"
                    >
                        <div className="badge-icon-wrapper">
                            <div className="badge-icon locked-icon">🔒</div>
                        </div>
                        <div className="badge-info">
                            <h4 className="badge-name">{badge.description}</h4>
                            <div className="badge-meta">
                                <span className={`badge-rarity ${getRarityClass(badge.rarity)}`}>
                                    {badge.rarity?.toUpperCase() || 'COMUM'}
                                </span>
                                <span className="badge-points">+{badge.points} pts</span>
                            </div>
                            <div className="badge-requirement">
                                {getBadgeRequirementText(badge)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {(displayedEarned.length === 0 && displayedLocked.length === 0) && (
                <div className="no-badges">
                    <div className="no-badges-icon">🎯</div>
                    <p>Nenhuma conquista encontrada nesta categoria</p>
                </div>
            )}
        </div>
    );
};

// Helper function to get requirement text
const getBadgeRequirementText = (badge) => {
    try {
        const req = JSON.parse(badge.requirement);
        if (req.totalTransactions) return `Registre ${req.totalTransactions} transações`;
        if (req.currentStreak) return `Mantenha ${req.currentStreak} dias consecutivos`;
        if (req.reportsGenerated) return `Gere ${req.reportsGenerated} relatórios`;
        if (req.positiveDaysCount) return `${req.positiveDaysCount} dias com saldo positivo`;
        return 'Complete o desafio';
    } catch {
        return 'Complete o desafio';
    }
};

export default BadgesDisplay;
