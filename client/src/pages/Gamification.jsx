import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import GamificationProgress from '../components/GamificationProgress';
import BadgesDisplay from '../components/BadgesDisplay';
import AchievementToast from '../components/AchievementToast';
import Leaderboard from '../components/Leaderboard';
import './Gamification.css';
import { API_URL } from '../utils/api';

const Gamification = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [achievement, setAchievement] = useState(null);

    useEffect(() => {
        fetchGamificationStats();
        updateStreak();
    }, []);

    const fetchGamificationStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${API_URL}/api/gamification/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            } else {
                console.error('Failed to fetch gamification stats');
            }
        } catch (error) {
            console.error('Error fetching gamification stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStreak = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/gamification/streak`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Show achievement if new badges were earned
                if (data.newBadges && data.newBadges.length > 0) {
                    setAchievement(data.newBadges[0]);
                }

                // Show level up notification
                if (data.pointsAwarded && data.pointsAwarded.leveledUp) {
                    // Could show a level up notification here
                    console.log('Level up!', data.pointsAwarded);
                }

                // Refresh stats
                fetchGamificationStats();
            }
        } catch (error) {
            console.error('Error updating streak:', error);
        }
    };

    const handleCloseAchievement = () => {
        setAchievement(null);
    };

    if (loading) {
        return (
            <div className="gamification-page">
                <Navbar />
                <div className="gamification-layout">
                    <Sidebar />
                    <div className="gamification-content">
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Carregando estatísticas...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="gamification-page">
            <Navbar />
            <div className="gamification-layout">
                <Sidebar />
                <div className="gamification-content">
                    <div className="gamification-header-section">
                        <h1>🎮 Gamificação</h1>
                        <p className="gamification-subtitle">
                            Acompanhe seu progresso, desbloqueie conquistas e suba de nível!
                        </p>
                    </div>

                    {stats && (
                        <>
                            <GamificationProgress stats={stats} />

                            <BadgesDisplay
                                earnedBadges={stats.earnedBadges || []}
                                lockedBadges={stats.lockedBadges || []}
                            />

                            <Leaderboard />
                        </>
                    )}

                    {!stats && (
                        <div className="no-stats">
                            <div className="no-stats-icon">📊</div>
                            <h3>Nenhuma estatística disponível</h3>
                            <p>Comece a usar o sistema para desbloquear conquistas!</p>
                        </div>
                    )}
                </div>
            </div>

            <AchievementToast
                achievement={achievement}
                onClose={handleCloseAchievement}
            />
        </div>
    );
};

export default Gamification;
