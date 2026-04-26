import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

const Leaderboard = () => {
    const [activeTab, setActiveTab] = useState('points'); // 'points' or 'streak'
    const [leaderboard, setLeaderboard] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
        fetchMyRank();
        fetchStats();
    }, [activeTab]);

    const fetchLeaderboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === 'points' ? 'points' : 'streak';
            const response = await fetch(`http://localhost:3005/api/gamification/leaderboard/${endpoint}?limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setLeaderboard(data);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRank = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3005/api/gamification/leaderboard/my-rank', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setMyRank(data);
            }
        } catch (error) {
            console.error('Error fetching my rank:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3005/api/gamification/leaderboard/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    const getRankClass = (rank) => {
        switch (rank) {
            case 1: return 'rank-gold';
            case 2: return 'rank-silver';
            case 3: return 'rank-bronze';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="leaderboard-loading">
                <div className="spinner"></div>
                <p>Carregando ranking...</p>
            </div>
        );
    }

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h2>🏆 Ranking Global</h2>
                <p className="leaderboard-subtitle">Compete com outros usuários e alcance o topo!</p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="leaderboard-stats">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-value">{stats.totalUsers}</div>
                        <div className="stat-label">Usuários Ativos</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">💎</div>
                        <div className="stat-value">{stats.averagePoints}</div>
                        <div className="stat-label">Média de Pontos</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🔥</div>
                        <div className="stat-value">{stats.topStreak}</div>
                        <div className="stat-label">Maior Streak</div>
                    </div>
                </div>
            )}

            {/* My Rank Card */}
            {myRank && (
                <div className="my-rank-card">
                    <div className="my-rank-content">
                        <div className="my-rank-icon">🎯</div>
                        <div className="my-rank-info">
                            <h3>Sua Posição</h3>
                            <div className="my-rank-details">
                                <span className="my-rank-number">{getRankIcon(myRank.rank)}</span>
                                <span className="my-rank-points">{myRank.points} pontos</span>
                                <span className="my-rank-level">Nível {myRank.level}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="leaderboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'points' ? 'active' : ''}`}
                    onClick={() => setActiveTab('points')}
                >
                    💎 Por Pontos
                </button>
                <button
                    className={`tab-btn ${activeTab === 'streak' ? 'active' : ''}`}
                    onClick={() => setActiveTab('streak')}
                >
                    🔥 Por Streak
                </button>
            </div>

            {/* Leaderboard Table */}
            <div className="leaderboard-table">
                {leaderboard.length > 0 ? (
                    leaderboard.map((user) => (
                        <div key={user.userId} className={`leaderboard-row ${getRankClass(user.rank)}`}>
                            <div className="rank-badge">
                                {getRankIcon(user.rank)}
                            </div>
                            <div className="user-info">
                                <div className="user-name">{user.name}</div>
                                <div className="user-company">{user.companyName}</div>
                            </div>
                            <div className="user-stats">
                                {activeTab === 'points' ? (
                                    <>
                                        <div className="stat-item">
                                            <span className="stat-value">{user.points}</span>
                                            <span className="stat-label">pontos</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value">Nv. {user.level}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="stat-item">
                                            <span className="stat-value">{user.currentStreak}</span>
                                            <span className="stat-label">dias</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="stat-value-small">Recorde: {user.longestStreak}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-data">
                        <div className="no-data-icon">📊</div>
                        <p>Nenhum dado disponível ainda</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
