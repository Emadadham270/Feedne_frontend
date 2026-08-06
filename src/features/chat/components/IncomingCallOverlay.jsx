import { useEffect, useState } from 'react';
import { chatService } from '@/services/chatService';
import { videoService } from '@/services/videoService';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Phone, Video, PhoneOff, ShieldCheck } from 'lucide-react';
import { VideoCallModal } from './VideoCallModal';
import { useAuthStore } from '@/store/authStore';

export function IncomingCallOverlay() {
  const { user } = useAuthStore();
  const [incomingCall, setIncomingCall] = useState(null); // { caller, roomUrl, roomName, callType }
  const [activeCall, setActiveCall]     = useState(null); // { partnerUser, callType, roomInfo }

  useEffect(() => {
    if (!user) return;

    // Connect socket if not connected
    chatService.connect();

    // Listen for incoming calls
    chatService.onIncomingCall((data) => {
      console.log('Incoming call received:', data);
      setIncomingCall(data);
    });

    // Listen for call declined by caller or ended
    chatService.onCallEnded(() => {
      setIncomingCall(null);
      setActiveCall(null);
    });

    chatService.onCallDeclined(() => {
      setIncomingCall(null);
    });

    return () => {
      chatService.offCallEvents();
    };
  }, [user]);

  const handleAccept = async () => {
    if (!incomingCall) return;

    try {
      // Get ZEGOCLOUD token for the receiver (isOwner: false, same roomName as caller)
      const tokenData = await videoService.createVideoRoom({
        isOwner:  false,
        callType: incomingCall.callType,
        roomName: incomingCall.roomName,  // Must match the caller's room ID
      });

      // Signal caller that call was accepted
      chatService.acceptCall({
        callerId: incomingCall.caller.id,
        roomName: incomingCall.roomName,
      });

      // Launch the call modal with pre-fetched room data
      setActiveCall({
        partnerUser: incomingCall.caller,
        callType:    incomingCall.callType,
        roomInfo:    {
          ...tokenData,
          // Override roomId to be the caller's room (not a new unique one)
          roomId: incomingCall.roomName,
        },
      });

      setIncomingCall(null);
    } catch (err) {
      console.error('Failed to accept call:', err);
      setIncomingCall(null);
    }
  };

  const handleDecline = () => {
    if (incomingCall) {
      chatService.declineCall({ callerId: incomingCall.caller.id });
      setIncomingCall(null);
    }
  };

  return (
    <>
      {/* INCOMING RINGING MODAL */}
      {incomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-sm w-full p-6 text-center space-y-5 shadow-2xl border border-neutral-700 bg-neutral-900 text-white rounded-2xl">
            {/* Header / Avatar */}
            <div className="relative inline-block mx-auto">
              <Avatar
                src={incomingCall.caller.avatar}
                name={incomingCall.caller.displayName || incomingCall.caller.username}
                size="xl"
                className="ring-4 ring-primary-500/50"
              />
              <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary-500 text-white">
                {incomingCall.callType === 'voice' ? <Phone size={16} /> : <Video size={16} />}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                {incomingCall.caller.displayName || incomingCall.caller.username}
              </h3>
              <p className="text-xs text-neutral-400">
                Incoming {incomingCall.callType === 'voice' ? 'Voice' : 'Video'} Call...
              </p>
            </div>

            <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <ShieldCheck size={14} /> End-to-End Encrypted
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-6 pt-2">
              {/* Decline */}
              <button
                onClick={handleDecline}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg">
                  <PhoneOff size={24} />
                </div>
                <span className="text-xs text-neutral-400">Decline</span>
              </button>

              {/* Accept */}
              <button
                onClick={handleAccept}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg animate-pulse">
                  {incomingCall.callType === 'voice' ? <Phone size={24} /> : <Video size={24} />}
                </div>
                <span className="text-xs text-neutral-400">Accept</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE CALL MODAL */}
      {activeCall && (
        <VideoCallModal
          isOpen={true}
          onClose={() => setActiveCall(null)}
          partnerUser={activeCall.partnerUser}
          callType={activeCall.callType}
          initialRoomInfo={activeCall.roomInfo}
        />
      )}
    </>
  );
}
