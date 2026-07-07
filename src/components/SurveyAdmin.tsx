import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { BarChart3, Plus, X, CheckCircle } from 'lucide-react';

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

interface SurveyAdminProps {
  matchId: string;
}

const SurveyAdmin: React.FC<SurveyAdminProps> = ({ matchId }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [activeSurveys, setActiveSurveys] = useState<SurveyData[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Listen for active surveys
  useEffect(() => {
    if (!matchId || !user?.isAdmin) return;

    const q = query(
      collection(db, 'surveys'),
      where('matchId', '==', matchId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const surveys: SurveyData[] = [];
      snapshot.forEach((doc) => {
        surveys.push({ ...doc.data(), id: doc.id } as SurveyData);
      });
      setActiveSurveys(surveys);
    });

    return () => unsubscribe();
  }, [matchId, user?.isAdmin]);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreateSurvey = async () => {
    if (!user?.isAdmin || !matchId) return;

    // Validation
    if (!question.trim()) {
      toast.error('Please enter a survey question.');
      return;
    }

    const filledOptions = options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      toast.error('Please provide at least 2 options.');
      return;
    }

    setIsCreating(true);
    try {
      const surveyOptions: SurveyOption[] = filledOptions.map((name, index) => ({
        id: `option_${index}`,
        name: name.trim(),
        votes: 0,
      }));

      await addDoc(collection(db, 'surveys'), {
        matchId,
        question: question.trim(),
        options: surveyOptions,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: 'active',
        userVotes: {},
      });

      toast.success('Survey created successfully!');
      setQuestion('');
      setOptions(['', '']);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating survey:', error);
      toast.error('Failed to create survey.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseSurvey = async (surveyId: string) => {
    if (!user?.isAdmin) return;

    try {
      await updateDoc(doc(db, 'surveys', surveyId), {
        status: 'closed',
      });
      toast.success('Survey closed.');
    } catch (error) {
      console.error('Error closing survey:', error);
      toast.error('Failed to close survey.');
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="space-y-3 p-4 bg-neutral-900/30 border-t border-neutral-800">
      {/* Create Survey Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-black uppercase tracking-widest h-10 rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Create Team Survey
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-neutral-950 border-neutral-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-400" />
              Create New Survey
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Question Input */}
            <div>
              <label className="text-xs font-black text-amber-400 uppercase tracking-widest block mb-2">
                Survey Question
              </label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Which team are you rooting for?"
                className="bg-neutral-900 border-neutral-800 text-white text-sm rounded-lg"
              />
            </div>

            {/* Options */}
            <div>
              <label className="text-xs font-black text-amber-400 uppercase tracking-widest block mb-2">
                Options
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="bg-neutral-900 border-neutral-800 text-white text-sm rounded-lg flex-1"
                    />
                    {options.length > 2 && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                        className="h-10 w-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="mt-2 border-neutral-700 text-neutral-400 hover:text-white w-full"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Option
              </Button>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateSurvey}
              disabled={isCreating}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest h-10 rounded-lg"
            >
              {isCreating ? 'Creating...' : 'Create Survey'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Surveys */}
      {activeSurveys.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-black text-amber-400 uppercase tracking-widest">Active Surveys</p>
          {activeSurveys.map((survey) => {
            const totalVotes = survey.options.reduce((sum, opt) => sum + opt.votes, 0);
            return (
              <div
                key={survey.id}
                className="p-3 bg-neutral-900/50 border border-amber-500/20 rounded-lg space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-amber-50 truncate">{survey.question}</p>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      {survey.options.length} options • {totalVotes} votes
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCloseSurvey(survey.id)}
                    className="h-8 text-xs shrink-0"
                  >
                    Close
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SurveyAdmin;
