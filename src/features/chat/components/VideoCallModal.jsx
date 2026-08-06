import { useEffect, useRef, useState, useCallback } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { videoService } from '@/services/videoService';
import { chatService } from '@/services/chatService';

// Read from Vite env — add VITE_ZEGO_APP_ID and VITE_ZEGO_SERVER_SECRET to Feedne_frontend/.env
const ZEGO_APP_ID      = Number(import.meta.env.VITE_ZEGO_APP_ID);
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET || '';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/services/api';
import { PhoneOff, Video, PhoneCall, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

/**
 * VideoCallModal — powered by ZEGOCLOUD UIKit Prebuilt.
 *
 * Flow:
 *  Caller  → idle → ringing → (call:accepted socket) → connecting → joined
 *  Receiver → (IncomingCallOverlay passes initialRoomInfo) → connecting → joined
 *
 * ZEGOCLOUD provides camera/mic natively and handles all ICE/STUN/TURN
 * negotiation automatically using their global infrastructure.
 */
export function VideoCallModal({
  isOpen,
  onClose,
  partnerUser,
  callType = 'video',
  initialRoomInfo = null,
}) {
  const { user: currentUser } = useAuthStore();

  const containerRef = useRef(null);
  const zpRef        = useRef(null);   // ZegoUIKitPrebuilt instance
  const ringTimerRef = useRef(null);
  const cancelRef    = useRef(false);

  const [callState, setCallState] = useState('idle');  // idle|ringing|connecting|joined|error
  const [errorMsg,  setErrorMsg]  = useState('');
  const [roomData,  setRoomData]  = useState(initialRoomInfo);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  const destroyZego = useCallback(() => {
    if (ringTimerRef.current) { clearTimeout(ringTimerRef.current); ringTimerRef.current = null; }
    if (zpRef.current) {
      try { zpRef.current.destroy?.(); } catch {}
      zpRef.current = null;
    }
    // Clear the container DOM manually so ZEGO doesn't leave artifacts
    if (containerRef.current) containerRef.current.innerHTML = '';
  }, []);

  const handleEndCall = useCallback(() => {
    cancelRef.current = true;
    destroyZego();
    if (partnerUser?.id) {
      try { chatService.endCall({ targetUserId: partnerUser.id }); } catch {}
    }
    setCallState('idle');
    onClose();
  }, [destroyZego, partnerUser, onClose]);

  // Unmount cleanup
  useEffect(() => () => {
    cancelRef.current = true;
    destroyZego();
    chatService.offCallEvents();
  }, [destroyZego]);

  // ── Socket listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    cancelRef.current = false;

    chatService.onCallAccepted(() => {
      if (cancelRef.current) return;
      if (ringTimerRef.current) { clearTimeout(ringTimerRef.current); ringTimerRef.current = null; }
      setCallState('connecting');
    });

    chatService.onCallDeclined(() => {
      if (cancelRef.current) return;
      setErrorMsg('Call was declined.');
      setCallState('error');
    });

    chatService.onCallEnded(() => {
      if (cancelRef.current) return;
      handleEndCall();
    });

    return () => { chatService.offCallEvents(); };
  }, [isOpen, handleEndCall]);

  // ── Initiation (runs once on open) ───────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    cancelRef.current = false;

    const init = async () => {
      setErrorMsg('');

      if (initialRoomInfo) {
        // Receiver: token already fetched by IncomingCallOverlay
        setRoomData(initialRoomInfo);
        setCallState('connecting');
        return;
      }

      // Caller: create ZEGOCLOUD room & token, then ring recipient
      setCallState('ringing');
      try {
        const roomName = partnerUser?.username ? `call-${partnerUser.username}` : undefined;
        const data = await videoService.createVideoRoom({ isOwner: true, callType, roomName });
        if (cancelRef.current) return;
        setRoomData(data);

        if (partnerUser?.id) {
          chatService.startCall({
            receiverId: partnerUser.id,
            roomUrl:    `zego://${data.roomId}`,
            roomName:   data.roomId,
            callType,
            caller:     currentUser,
          });
        }

        // 45 s ring timeout
        ringTimerRef.current = setTimeout(() => {
          if (!cancelRef.current) {
            setErrorMsg('No answer after 45 s.');
            setCallState('error');
          }
        }, 45_000);
      } catch (err) {
        if (!cancelRef.current) {
          setErrorMsg(getErrorMessage(err));
          setCallState('error');
        }
      }
    };

    init();
  }, [isOpen]); // intentionally only re-runs on open/close toggle

  // ── ZEGOCLOUD join (runs when state reaches 'connecting') ─────────────────
  useEffect(() => {
    if (callState !== 'connecting' || !roomData || !containerRef.current) return;

    let localCancelled = false;

    const joinZego = () => {
      try {
        // Clean up any previous instance first
        destroyZego();
        if (localCancelled || cancelRef.current) return;

        const { roomId } = roomData;
        const zegoUserId   = currentUser?.id       || roomData.userId   || 'guest';
        const zegoUserName = currentUser?.username  || roomData.username || 'Guest';

        // generateKitTokenForTest works with AppID + Server Secret directly.
        // For production harden to generateKitTokenForProduction with backend token.
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          ZEGO_APP_ID,
          ZEGO_SERVER_SECRET,
          roomId,
          zegoUserId,
          zegoUserName,
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        zp.joinRoom({
          container:  containerRef.current,
          maxUsers:   2,

          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },

          // Skip the pre-join camera-check screen for seamless UX
          showPreJoinView: false,

          // Voice call → start with camera off
          turnOnCameraWhenJoining:     callType !== 'voice',
          turnOnMicrophoneWhenJoining: true,
          useFrontFacingCamera:        true,

          // Built-in toolbar has all controls; hide our duplicate ones
          showLeavingView: false,

          onJoinRoom: () => {
            if (!localCancelled && !cancelRef.current) setCallState('joined');
          },

          onLeaveRoom: () => {
            if (!localCancelled && !cancelRef.current) handleEndCall();
          },

          onUserLeave: () => {
            // Other participant left
            if (!localCancelled && !cancelRef.current) handleEndCall();
          },
        });
      } catch (err) {
        console.error('[ZEGO] join error:', err);
        if (!localCancelled && !cancelRef.current) {
          setErrorMsg(err?.message || getErrorMessage(err) || 'Could not connect to call.');
          setCallState('error');
        }
      }
    };

    joinZego();
    return () => { localCancelled = true; };
  }, [callState, roomData, callType, handleEndCall, destroyZego, currentUser]);

  // ── Render ────────────────────────────────────────────────────────────────
  const title = (
    <div className="flex items-center gap-2">
      {callType === 'voice'
        ? <PhoneCall size={18} className="text-primary-500" />
        : <Video     size={18} className="text-primary-500" />}
      <span>{callType === 'voice' ? 'Voice Call' : 'Video Call'}</span>
      {partnerUser && (
        <span className="text-xs text-neutral-400 font-normal">
          with @{partnerUser.username}
        </span>
      )}
      <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold flex items-center gap-1">
        <ShieldCheck size={12} /> Encrypted
      </span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleEndCall} title={title} size="xl">
      <div className="p-4">
        {/*
          The container MUST always be in the DOM at full size so ZEGOCLOUD
          can render its UI. Status overlays sit on top via absolute positioning.
        */}
        <div
          className="relative w-full rounded-2xl overflow-hidden bg-neutral-950"
          style={{ height: 540 }}
        >
          {/* ZEGOCLOUD renders its full UI into this div */}
          <div
            ref={containerRef}
            style={{
              position:      'absolute',
              inset:         0,
              width:         '100%',
              height:        '100%',
              // Visible only once joined; hidden but sized otherwise
              opacity:       callState === 'joined' ? 1 : 0,
              pointerEvents: callState === 'joined' ? 'auto' : 'none',
              transition:    'opacity 0.4s ease',
            }}
          />

          {/* ── Ringing overlay ─────────────────────────────────────────── */}
          {callState === 'ringing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-neutral-900 text-white z-10">
              <div className="relative">
                <Avatar
                  src={partnerUser?.avatar}
                  name={partnerUser?.displayName || partnerUser?.username || 'User'}
                  size="xl"
                  className="ring-4 ring-primary-500/50 animate-pulse"
                />
                <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary-500 text-white">
                  {callType === 'voice' ? <PhoneCall size={14} /> : <Video size={14} />}
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">Calling @{partnerUser?.username || 'User'}…</p>
                <p className="text-xs text-neutral-400 mt-1">Ringing — waiting up to 45 s</p>
              </div>
              <button
                onClick={handleEndCall}
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center gap-2 shadow transition-transform hover:scale-105"
              >
                <PhoneOff size={16} /> Cancel
              </button>
            </div>
          )}

          {/* ── Connecting overlay ───────────────────────────────────────── */}
          {callState === 'connecting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900 text-white z-10">
              <div className="w-10 h-10 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Connecting — allow camera/mic when prompted…</p>
            </div>
          )}

          {/* ── Error overlay ────────────────────────────────────────────── */}
          {callState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900 text-white z-10 p-6 text-center">
              <p className="text-sm font-bold text-red-400 break-words max-w-xs">{errorMsg}</p>
              <Button variant="primary" size="sm" onClick={handleEndCall}>Close</Button>
            </div>
          )}
        </div>

        {/* End call button below (complementing ZEGOCLOUD's built-in toolbar) */}
        {callState === 'joined' && (
          <div className="flex justify-center pt-3">
            <button
              onClick={handleEndCall}
              className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold flex items-center gap-2 shadow transition-colors"
            >
              <PhoneOff size={16} /> End Call
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
