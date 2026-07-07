import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { BarChart3, Check } from 'lucide-react';

interface SurveyOption {
  id: string;
  name: string;
  votes: number;
}

interface SurveyData {
  id: string;
  matchId: string;
  question: string;
  options: SurveyOption[];
  createdBy: string;
  createdAt: Timestamp;
  status: 'active' | 'closed';
  userVotes: { [userId: string]: string };
}

interface SurveyProps {
  matchId: string;
  surveyId: string;
}

const Survey: React.FC<SurveyProps> = ({ matchId, surveyId }) => {
  const { user } = useAuth();
  const [survey, setSurvey] = useState<SurveyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);

  useEffect(() => {
    if (!surveyId) return;

    const unsubscribe = getDoc(doc(db, 'surveys', surveyId)).then((doc) => {
      if (doc.exists()) {
        const data = doc.data() as SurveyData;
        setSurvey({ ...data, id: doc.id });
        
        // Check if current user has already voted
        if (user && data.userVotes?.[user.uid]) {
          setUserVote(data.userVotes[user.uid]);
        }
      }
      setIsLoading(false);
    });

    return () => {
      // Cleanup if needed
    };
  }, [surveyId, user]);

  const handleVote = async (optionId: string) => {
    if (!user || !survey) return;

    setIsVoting(true);
    try {
      const surveyRef = doc(db, 'surveys', surveyId);
      
      // If user already voted, remove their previous vote
      if (userVote && userVote !== optionId) {
        const oldOption = survey.options.find(o => o.id === userVote);
        if (oldOption) {
          await updateDoc(surveyRef, {
            [`options.${survey.options.indexOf(oldOption)}.votes`]: oldOption.votes - 1,
            [`userVotes.${user.uid}`]: optionId,
          });
        }
      } else if (!userVote) {
        // New vote
        const optionIndex = survey.options.findIndex(o => o.id === optionId);
        if (optionIndex !== -1) {
          await updateDoc(surveyRef, {
            [`options.${optionIndex}.votes`]: survey.options[optionIndex].votes + 1,
            [`userVotes.${user.uid}`]: optionId,
          });
        }
      }

      setUserVote(optionId);
      toast.success('Vote recorded!');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote.');
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!survey) {
    return null;
  }

  const totalVotes = survey.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/30 rounded-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Survey Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-amber-400 shrink-0" />
          <div>
            <p className="text-xs font-black text-amber-400 uppercase tracking-widest">Live Survey</p>
            <p className="text-sm font-semibold text-amber-50 mt-1">{survey.question}</p>
          </div>
        </div>
        {survey.status === 'closed' && (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/40 shrink-0">Closed</Badge>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {survey.options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isUserVote = userVote === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={isVoting || survey.status === 'closed' || !user}
              className={`w-full relative group transition-all ${ 
                isUserVote ? 'ring-2 ring-amber-400' : ''
              }`}
            >
              {/* Background bar */}
              <div
                className={`absolute inset-0 rounded-lg transition-all duration-300 ${ 
                  isUserVote 
                    ? 'bg-gradient-to-r from-amber-500/40 to-yellow-500/30' 
                    : 'bg-amber-500/20 group-hover:bg-amber-500/30'
                }`}
                style={{ width: `${percentage}%` }}
              />

              {/* Content */}
              <div className="relative p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {isUserVote && (
                    <Check className="h-4 w-4 text-amber-400 shrink-0" />
                  )}
                  <span className="text-sm font-semibold text-amber-50 truncate">
                    {option.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs font-bold text-amber-300">
                    {option.votes}
                  </span>
                  <span className="text-xs text-amber-300/70 font-mono">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Vote Count */}
      <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
        <p className="text-[10px] text-amber-300/70 font-mono uppercase tracking-tight">
          Total Votes: {totalVotes}
        </p>
        {!user && (
          <p className="text-[10px] text-amber-300/70 font-bold uppercase">
            Sign in to vote
          </p>
        )}
      </div>
    </div>
  );
};

export default Survey;
