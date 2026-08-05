import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Button } from '@/components/ui/Button';
import { groupService } from '@/services/groupService';
import { getErrorMessage } from '@/services/api';
import { Users, Link as LinkIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export function JoinGroupPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleJoin = async () => {
    if (!code) return;
    setIsJoining(true);
    setError(null);
    try {
      const res = await groupService.joinByInviteCode(code);
      setSuccess(res.message || 'Joined group successfully!');
      setTimeout(() => {
        if (res.member?.groupId) {
          navigate(ROUTES.GROUP_VIEW(res.member.groupId));
        } else {
          navigate(ROUTES.HOME);
        }
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <MainLayout showRightPanel={false}>
      <div className="max-w-md mx-auto py-20 px-4 animate-fade-in">
        <div className="card p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-500 flex items-center justify-center mx-auto shadow-md">
            <Users size={32} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Group Invitation
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              You’ve been invited to join a group on Feedne using code:
            </p>
            <code className="mt-2 inline-block px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-primary-600 dark:text-primary-400 font-mono text-xs rounded-lg border border-neutral-200 dark:border-neutral-700">
              {code}
            </code>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200 dark:border-red-900">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 text-xs rounded-xl border border-green-200 dark:border-green-900">
              <CheckCircle size={16} className="flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => navigate(ROUTES.HOME)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              isLoading={isJoining}
              onClick={handleJoin}
              disabled={isJoining || !!success}
            >
              Accept & Join
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
