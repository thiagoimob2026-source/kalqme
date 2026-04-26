import React, { useState, useEffect } from 'react';
import './AchievementToast.css';

const AchievementToast = ({ achievement, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        if (achievement) {
            setIsVisible(true);
            setIsLeaving(false);

            // Auto-close after 5 seconds
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [achievement]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 500);
    };

    if (!achievement || !isVisible) return null;

    const getRarityClass = (rarity) => {
        return `rarity-${rarity || 'common'}`;
    };

    return (
        <div className={`achievement-toast ${isLeaving ? 'leaving' : ''} ${getRarityClass(achievement.rarity)}`}>
            <div className="achievement-confetti">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="confetti-piece" style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        animationDuration: `${1 + Math.random()}s`
                    }} />
                ))}
            </div>

            <div className="achievement-content">
                <div className="achievement-icon-wrapper">
                    <div className="achievement-icon-glow"></div>
                    <div className="achievement-icon">{achievement.icon || '🏆'}</div>
                </div>

                <div className="achievement-details">
                    <div className="achievement-header">
                        <span className="achievement-label">🎉 Conquista Desbloqueada!</span>
                        {achievement.rarity && (
                            <span className={`achievement-rarity ${getRarityClass(achievement.rarity)}`}>
                                {achievement.rarity.toUpperCase()}
                            </span>
                        )}
                    </div>
                    <h3 className="achievement-title">{achievement.description}</h3>
                    {achievement.points && (
                        <div className="achievement-points">
                            <span className="points-badge">+{achievement.points} pontos</span>
                        </div>
                    )}
                </div>

                <button className="achievement-close" onClick={handleClose}>×</button>
            </div>
        </div>
    );
};

export default AchievementToast;
