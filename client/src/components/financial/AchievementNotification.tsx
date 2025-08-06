import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Trophy, Star } from "lucide-react";

interface Achievement {
  title: string;
  description: string;
  icon: string;
  points?: number;
}

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementNotification({ 
  achievement, 
  onClose 
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Show notification with animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide after 5 seconds
    const hideTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getEmojiDisplay = (icon: string) => {
    // If icon is an emoji, return it; otherwise return a default trophy
    return /\p{Emoji}/u.test(icon) ? icon : '🏆';
  };

  return (
    <div 
      className={`fixed top-20 right-6 z-50 transition-all duration-300 ${
        isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 animate-bounce-gentle' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <Card className="bg-white shadow-2xl border-l-4 border-accent max-w-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Achievement Icon */}
            <div className="w-12 h-12 bg-gradient-to-r from-accent to-accent/80 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">{getEmojiDisplay(achievement.icon)}</span>
            </div>
            
            {/* Achievement Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-primary mb-1">
                    Achievement Unlocked!
                  </h4>
                  <p className="font-semibold text-foreground text-sm mb-1">
                    {achievement.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {achievement.description}
                  </p>
                  
                  {/* Achievement Points/Rating */}
                  <div className="flex items-center space-x-2 mt-3">
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-3 h-3 text-accent fill-current" 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-primary font-semibold">
                      +{achievement.points || 150} XP
                    </span>
                  </div>
                </div>
                
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Progress Bar Animation */}
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-1">
              <div 
                className="bg-accent h-1 rounded-full transition-all duration-2000 ease-out"
                style={{ 
                  width: isVisible ? '100%' : '0%',
                  transitionDelay: '0.5s'
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
