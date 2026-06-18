import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    AlertTriangle,
    CheckCircle2,
    KeyRound,
    Laptop,
    LockKeyhole,
    ShieldAlert,
    Sparkles,
    UserRound,
} from 'lucide-react';
import Dashboard from '../Dashboard';
import Loading from '../Loading/Loading.jsx';
import Footer from '../Footer.jsx';
import { getAuditLogsService, getMyProfile } from '../../Service/Auth.service.js';
import {
    connectSecuritySignals,
    disconnectSecuritySignals,
} from '../../Service/SecuritySignals.service.js';

function Profile() {
    const [user, setUser] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const data = await getMyProfile();
            setUser(data);
        };

        const fetchAuditLogs = async () => {
            const logs = await getAuditLogsService();
            setAuditLogs(logs);
        };

        fetchUserProfile();
        fetchAuditLogs();
    }, []);

    useEffect(() => {
        const socket = connectSecuritySignals();
        if (!socket) return undefined;

        const handleSecurityEvent = (event) => {
            setAuditLogs((prevLogs) => [
                {
                    ...event,
                    _id: `${event.type}-${event.occurredAt}`,
                    occurredAt: event.occurredAt,
                },
                ...prevLogs,
            ].slice(0, 20));

            if (event.severity === 'warning') {
                toast(event.type.replaceAll('_', ' '), { icon: '!' });
            }
        };

        socket.on('security:event', handleSecurityEvent);

        return () => {
            socket.off('security:event', handleSecurityEvent);
            disconnectSecuritySignals();
        };
    }, []);

    const formatEventLabel = (value) =>
        String(value || '')
            .split('_')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');

    const getSignalIcon = (type) => {
        switch (type) {
            case 'login_from_new_device':
                return <Laptop className="h-5 w-5" />;
            case 'vault_unlock_failed_multiple':
                return <ShieldAlert className="h-5 w-5" />;
            case 'recovery_key_regenerated':
                return <KeyRound className="h-5 w-5" />;
            case 'vault_rotated':
                return <LockKeyhole className="h-5 w-5" />;
            case 'login_success':
                return <CheckCircle2 className="h-5 w-5" />;
            default:
                return <AlertTriangle className="h-5 w-5" />;
        }
    };

    const getSeverityTheme = (severity) => {
        if (severity === 'warning') {
            return {
                badge: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
                iconWrap: 'bg-amber-300/14 text-amber-100 ring-1 ring-amber-300/20',
                glow: 'from-amber-300/12 via-transparent to-transparent',
            };
        }

        return {
            badge: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100',
            iconWrap: 'bg-cyan-300/15 text-cyan-100 ring-1 ring-cyan-300/20',
            glow: 'from-cyan-300/12 via-transparent to-transparent',
        };
    };

    const getEventSummary = (event) => {
        switch (event.type) {
            case 'login_from_new_device':
                return 'A trusted session started from a device this account had not seen before.';
            case 'vault_unlock_failed_multiple':
                return 'Local vault unlock failed multiple times, which usually means the wrong secret was entered repeatedly.';
            case 'recovery_key_regenerated':
                return 'A fresh recovery key replaced the previous one during key rotation.';
            case 'vault_rotated':
                return 'Vault wrapping credentials were rotated while the stored entry ciphertext stayed unchanged.';
            case 'login_success':
                return 'A sign-in completed successfully and the session was established.';
            default:
                return 'Recent security-related activity for this account.';
        }
    };

    const getEventContext = (event) => {
        const details = [];
        if (event.metadata?.deviceLabel) details.push(event.metadata.deviceLabel);
        if (event.metadata?.unlockMethod) details.push(`${formatEventLabel(event.metadata.unlockMethod)} unlock`);
        if (event.metadata?.failedCount) details.push(`${event.metadata.failedCount} failed attempts`);
        if (event.metadata?.websiteName) details.push(event.metadata.websiteName);
        if (event.metadata?.reason) details.push(formatEventLabel(event.metadata.reason));
        return details;
    };

    const warningCount = auditLogs.filter((event) => event.severity === 'warning').length;
    const latestEvent = auditLogs[0];

    if (!user) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen overflow-hidden bg-gradient-to-br from-[#1B1F3B] via-[#24385d] to-[#4D869C] text-[#F5F7FA]">
            <Dashboard />

            <div className="relative">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute left-[8%] top-16 h-56 w-56 rounded-full bg-[#81c3d7]/12 blur-3xl" />
                    <div className="absolute right-[10%] top-28 h-72 w-72 rounded-full bg-[#3A7CA5]/18 blur-3xl" />
                    <div className="absolute bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#0f2741]/30 blur-3xl" />
                </div>

                <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
                    <section
                        className="relative overflow-hidden rounded-[2rem] border border-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8 lg:p-10"
                        style={{ background: 'linear-gradient(135deg, rgba(129,195,215,0.18) 0%, rgba(18,28,58,0.94) 38%, rgba(8,16,36,0.98) 100%)' }}
                    >
                        <div className="absolute -right-16 top-0 h-44 w-44 rounded-full bg-[#81c3d7]/12 blur-3xl" />
                        <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-[#3A7CA5]/14 blur-3xl" />

                        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#81c3d7]/25 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#b7e8f5] backdrop-blur">
                                    <Sparkles className="h-4 w-4" />
                                    Account Overview
                                </div>

                                <div className="mt-6 flex items-start gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur">
                                        <UserRound className="h-8 w-8 text-[#d6f4ff]" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                                            {user.fullname}
                                        </h1>
                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                                            Your profile, vault status, and recent security activity all live here.
                                            This view is tuned for quick checks, not raw logs.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                        <div className="text-xs uppercase tracking-[0.2em] text-slate-300">Username</div>
                                        <div className="mt-2 text-lg font-semibold text-white">{user.username}</div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                        <div className="text-xs uppercase tracking-[0.2em] text-slate-300">Member Since</div>
                                        <div className="mt-2 text-lg font-semibold text-white">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                                        <div className="text-xs uppercase tracking-[0.2em] text-slate-300">Warning Signals</div>
                                        <div className="mt-2 text-lg font-semibold text-white">{warningCount}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5 shadow-xl shadow-black/25 backdrop-blur sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-xs uppercase tracking-[0.22em] text-[#81c3d7]">
                                            Security Snapshot
                                        </div>
                                        <div className="mt-2 text-2xl font-bold text-white">
                                            {latestEvent ? formatEventLabel(latestEvent.type) : 'No alerts yet'}
                                        </div>
                                    </div>
                                    <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
                                        Live
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="text-sm text-slate-300">Primary email</div>
                                        <div className="mt-2 break-all text-lg font-semibold text-white">
                                            {user.email}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="text-sm text-slate-300">Latest update</div>
                                        <div className="mt-2 text-base font-medium text-white">
                                            {latestEvent ? getEventSummary(latestEvent) : 'Your activity feed will appear here as signals arrive.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
                        <div className="rounded-[2rem] border border-white/10 bg-slate-900/55 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-7">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Identity</h2>
                                    <p className="mt-1 text-sm text-slate-300">
                                        Core account details with a cleaner, read-first layout.
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                                    Stable
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                {[
                                    { label: 'Email', value: user.email },
                                    { label: 'Full name', value: user.fullname },
                                    { label: 'Username', value: user.username },
                                    { label: 'Created', value: new Date(user.createdAt).toLocaleDateString() },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4"
                                    >
                                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                            {item.label}
                                        </div>
                                        <div className="mt-2 break-all text-lg font-semibold text-white">
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-white/10 bg-slate-900/55 p-6 shadow-2xl shadow-black/25 backdrop-blur sm:p-7">
                            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Security Activity</h2>
                                    <p className="mt-1 text-sm text-slate-300">
                                        Live signals and recent audit events for this account.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                                        Live
                                    </div>
                                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                                        {auditLogs.length} events
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                {auditLogs.length > 0 ? auditLogs.map((event, index) => {
                                    const theme = getSeverityTheme(event.severity);
                                    const context = getEventContext(event);

                                    return (
                                        <div
                                            key={event._id || `${event.type}-${index}`}
                                            className="group relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-800/70 p-5 transition-transform duration-200 hover:-translate-y-0.5"
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-r ${theme.glow} opacity-80`} />
                                            <div className="relative">
                                                <div className="flex items-start gap-4">
                                                    <div className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${theme.iconWrap}`}>
                                                        {getSignalIcon(event.type)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-lg font-semibold text-white">
                                                                {formatEventLabel(event.type)}
                                                            </h3>
                                                            <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${theme.badge}`}>
                                                                {event.severity || 'info'}
                                                            </span>
                                                        </div>

                                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                                                            {getEventSummary(event)}
                                                        </p>

                                                        <div className="mt-3 text-xs font-medium text-slate-300">
                                                            {new Date(event.occurredAt || event.createdAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">
                                                        {event.route || 'Security event'}
                                                    </span>
                                                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">
                                                        Status: {event.status || 'success'}
                                                    </span>
                                                    {context.map((detail) => (
                                                        <span
                                                            key={detail}
                                                            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200"
                                                        >
                                                            {detail}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-8 text-center">
                                        <div className="text-lg font-semibold text-white">No activity yet</div>
                                        <div className="mt-2 text-sm text-slate-300">
                                            Your security feed will start filling in as sign-ins, vault actions, and alerts occur.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default Profile;
