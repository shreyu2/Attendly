import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Modal } from '../components/ui/Modal';
import { TimetableEntry, ClassType } from '../types';
import { getDayName } from '../lib/dateUtils';

interface ParsedEntry {
  subjectName: string;
  code: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  class_type: ClassType;
  room: string;
}

export const Timetable: React.FC = () => {
  const { profile } = useAuth();
  const {
    subjects,
    timetable,
    addTimetableEntry,
    updateTimetableEntry,
    deleteTimetableEntry,
    addSubject,
  } = useAttendance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  // Form State
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [classType, setClassType] = useState<ClassType>('Lecture');
  const [room, setRoom] = useState('');

  // File Import State
  const [isImportBannerOpen, setIsImportBannerOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [previewParsedList, setPreviewParsedList] = useState<ParsedEntry[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const days = [
    { num: 1, name: 'Monday', short: 'Mon' },
    { num: 2, name: 'Tuesday', short: 'Tue' },
    { num: 3, name: 'Wednesday', short: 'Wed' },
    { num: 4, name: 'Thursday', short: 'Thu' },
    { num: 5, name: 'Friday', short: 'Fri' },
    { num: 6, name: 'Saturday', short: 'Sat' },
  ];

  const openAddModal = (defaultDay: number = 1) => {
    if (subjects.length === 0) {
      alert('Please add at least one subject first before scheduling timetable slots.');
      return;
    }
    setEditingEntry(null);
    setSelectedSubjectId(subjects[0]?.id || '');
    setDayOfWeek(defaultDay);
    setStartTime('09:00');
    setEndTime('10:00');
    setClassType('Lecture');
    setRoom('');
    setIsModalOpen(true);
  };

  const openEditModal = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setSelectedSubjectId(entry.subject_id);
    setDayOfWeek(entry.day_of_week);
    setStartTime(entry.start_time);
    setEndTime(entry.end_time);
    setClassType(entry.class_type);
    setRoom(entry.room || '');
    setIsModalOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;

    if (editingEntry) {
      await updateTimetableEntry(editingEntry.id, {
        subject_id: selectedSubjectId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        class_type: classType,
        room,
      });
    } else {
      await addTimetableEntry({
        subject_id: selectedSubjectId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        class_type: classType,
        room,
      });
    }

    setIsModalOpen(false);
  };

  // Structured Timetable JSON/CSV File Import Handler (Real file parsing, no fake mocks)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setImportFileName(file.name);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            const entries: ParsedEntry[] = parsed.map((item: any) => ({
              subjectName: item.subjectName || item.subject || 'Subject',
              code: (item.code || item.subjectCode || 'GEN').toUpperCase(),
              day_of_week: Number(item.day_of_week || item.day || 1),
              start_time: item.start_time || item.startTime || '09:00',
              end_time: item.end_time || item.endTime || '10:00',
              class_type: item.class_type || item.type || 'Lecture',
              room: item.room || '',
            }));
            setPreviewParsedList(entries);
            setIsImportBannerOpen(true);
          } else {
            setImportError('JSON file must contain an array of timetable entries.');
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length > 1) {
            const entries: ParsedEntry[] = [];
            // Assuming header: day,start,end,code,name,type,room
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
              if (cols.length >= 4) {
                entries.push({
                  day_of_week: parseInt(cols[0]) || 1,
                  start_time: cols[1] || '09:00',
                  end_time: cols[2] || '10:00',
                  code: (cols[3] || 'GEN').toUpperCase(),
                  subjectName: cols[4] || cols[3] || 'Subject',
                  class_type: (cols[5] as ClassType) || 'Lecture',
                  room: cols[6] || '',
                });
              }
            }
            setPreviewParsedList(entries);
            setIsImportBannerOpen(true);
          } else {
            setImportError('CSV file has no data rows.');
          }
        } else {
          setImportError('Direct PDF/Image OCR requires high-resolution OCR processing. Please import your schedule via JSON/CSV format or create class slots manually using the button above.');
          setIsImportBannerOpen(true);
          setPreviewParsedList([]);
        }
      } catch (err: any) {
        setImportError(`Failed to parse file: ${err.message || 'Invalid format'}`);
        setIsImportBannerOpen(true);
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (previewParsedList.length === 0) return;

    for (const item of previewParsedList) {
      let subject = subjects.find(s => s.code.toLowerCase() === item.code.toLowerCase());
      let subjectId = subject?.id;

      if (!subject) {
        await addSubject({
          name: item.subjectName,
          code: item.code,
          target_percentage: null,
          room: item.room,
        });
        const updatedSubs = subjects.find(s => s.code.toLowerCase() === item.code.toLowerCase());
        subjectId = updatedSubs?.id;
      }

      if (subjectId) {
        await addTimetableEntry({
          subject_id: subjectId,
          day_of_week: item.day_of_week,
          start_time: item.start_time,
          end_time: item.end_time,
          class_type: item.class_type,
          room: item.room,
        });
      }
    }

    setIsImportBannerOpen(false);
    setPreviewParsedList([]);
  };

  return (
    <div className="flex flex-col w-full pb-space-3xl">
      
      {/* Top Action Deck & Header Block */}
      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg mb-space-xl">
        <div className="flex flex-col gap-space-2xs">
          <div className="flex items-center gap-space-xs text-primary-container">
            <span className="material-symbols-outlined text-title-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              calendar_view_week
            </span>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary-container font-semibold">
              Weekly Timetable Engine
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Weekly Timetable
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-space-xs flex-wrap">
            <span className="font-label-data-md text-label-data-md text-on-surface">
              {profile?.semester || 'Academic Schedule'}
            </span>
            {profile?.department && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                <span>{profile.department}</span>
              </>
            )}
            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
            <span className="text-tertiary font-label-data-md text-label-data-md font-semibold">
              {timetable.length} {timetable.length === 1 ? 'Contact Slot' : 'Contact Slots'}
            </span>
          </p>
        </div>

        {/* Action Button Constellation */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <GlassButton variant="primary" icon="add" onClick={() => openAddModal(1)}>
            Add Class Slot
          </GlassButton>

          {/* File Input for JSON / CSV */}
          <label className="relative group overflow-hidden px-space-lg py-space-xs rounded-full bg-gradient-to-r from-primary-container/20 to-secondary-container/20 text-on-surface backdrop-blur-2xl border border-white/10 hover:border-primary/40 transition-all duration-300 flex items-center gap-space-xs cursor-pointer active:scale-95 shadow-sm">
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="material-symbols-outlined text-primary-container group-hover:scale-110 transition-transform">
              upload_file
            </span>
            <span className="font-title-sm text-title-sm font-semibold tracking-wide text-on-surface">
              {isProcessingFile ? 'Analyzing File...' : 'Import Timetable (JSON/CSV)'}
            </span>
          </label>
        </div>
      </section>

      {/* No Subjects Onboarding Banner */}
      {subjects.length === 0 && (
        <div className="mb-space-xl p-space-lg rounded-2xl bg-primary-container/10 border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-primary-container/30 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">library_add</span>
            </div>
            <div>
              <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                Add Subjects Before Configuring Timetable
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Each timetable entry connects to an enrolled subject. Create your subjects first to get started.
              </p>
            </div>
          </div>
          <Link
            to="/subjects"
            className="px-space-md py-space-xs rounded-full bg-primary-container text-on-primary-container font-title-sm text-title-sm hover:opacity-90 transition-all shrink-0"
          >
            Go to Subjects
          </Link>
        </div>
      )}

      {/* Timetable Upload & Preview Verification Glass Banner */}
      {isImportBannerOpen && (
        <section className="relative overflow-hidden mb-space-2xl p-space-lg rounded-2xl bg-surface-container-low/80 backdrop-blur-3xl border border-white/10 shadow-2xl transition-all duration-300">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-tertiary-container/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-space-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
              <div className="flex items-start gap-space-md">
                <div className={`p-space-sm rounded-xl flex items-center justify-center shrink-0 ${
                  importError ? 'bg-error-container/20 text-error' : 'bg-tertiary-container/20 text-tertiary'
                }`}>
                  <span className="material-symbols-outlined text-3xl">
                    {importError ? 'report_problem' : 'verified_user'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className={`px-space-xs py-0.5 rounded-full font-label-caps text-label-caps uppercase font-bold ${
                      importError ? 'bg-error/15 text-error' : 'bg-tertiary/15 text-tertiary'
                    }`}>
                      {importError ? 'Notice' : 'Extracted & Ready for Confirmation'}
                    </span>
                    <span className="font-label-data-md text-label-data-md text-on-surface font-semibold">
                      {importFileName}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {importError ? (
                      importError
                    ) : (
                      <>
                        <strong className="text-on-surface font-semibold">
                          {previewParsedList.length} classes parsed
                        </strong>
                        . Please review the entries below before confirming to save them to your account.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-space-sm shrink-0">
                <GlassButton variant="ghost" onClick={() => { setIsImportBannerOpen(false); setImportError(null); }}>
                  Dismiss
                </GlassButton>
                {previewParsedList.length > 0 && !importError && (
                  <GlassButton variant="emerald" icon="check_circle" onClick={handleConfirmImport}>
                    Confirm & Apply Timetable
                  </GlassButton>
                )}
              </div>
            </div>

            {/* Editable Preview Table */}
            <div className="max-h-60 overflow-y-auto rounded-xl bg-surface-container-lowest/60 border border-white/5 p-space-xs">
              <table className="w-full text-left text-body-sm">
                <thead>
                  <tr className="border-b border-white/5 text-outline font-label-caps text-label-caps">
                    <th className="p-2">Day</th>
                    <th className="p-2">Time</th>
                    <th className="p-2">Subject</th>
                    <th className="p-2">Code</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {previewParsedList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-high/40">
                      <td className="p-2 font-semibold text-primary">{getDayName(item.day_of_week)}</td>
                      <td className="p-2 font-label-data-md">{item.start_time} - {item.end_time}</td>
                      <td className="p-2 text-on-surface font-medium">{item.subjectName}</td>
                      <td className="p-2 text-secondary">{item.code}</td>
                      <td className="p-2">{item.class_type}</td>
                      <td className="p-2 text-on-surface-variant">{item.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Category Legend Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md mb-space-md px-space-xs">
        <div className="flex items-center gap-space-sm flex-wrap">
          <span className="font-label-caps text-label-caps uppercase text-outline">Categories:</span>
          <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-primary-container/10 text-primary font-label-caps text-label-caps border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary-container" /> Lecture
          </span>
          <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-secondary-container/30 text-secondary font-label-caps text-label-caps border border-secondary/30">
            <span className="w-2 h-2 rounded-full bg-secondary" /> Practical Lab
          </span>
          <span className="inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-label-caps text-label-caps border border-tertiary/20">
            <span className="w-2 h-2 rounded-full bg-tertiary" /> Tutorial / Activity
          </span>
        </div>
      </div>

      {/* 6-Day Weekly Matrix (Mon - Sat) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
        {days.map(dayItem => {
          const dayEntries = timetable
            .filter(t => t.day_of_week === dayItem.num)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));

          return (
            <GlassCard
              key={dayItem.num}
              variant="base"
              className="p-space-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-white/5">
                  <div className="flex items-center gap-space-xs">
                    <h3 className="font-headline-md text-headline-md text-on-surface">
                      {dayItem.name}
                    </h3>
                    <span className="font-label-caps text-label-caps text-outline">
                      ({dayEntries.length} {dayEntries.length === 1 ? 'class' : 'classes'})
                    </span>
                  </div>
                  <button
                    onClick={() => openAddModal(dayItem.num)}
                    className="p-1.5 rounded-full bg-surface-container-high/60 hover:bg-surface-container-highest text-primary transition-colors cursor-pointer"
                    title={`Add class to ${dayItem.name}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>

                {/* Day Slot Cards List */}
                {dayEntries.length === 0 ? (
                  <div className="py-space-xl text-center text-outline font-body-sm">
                    No classes scheduled for {dayItem.name}
                  </div>
                ) : (
                  <div className="flex flex-col gap-space-xs">
                    {dayEntries.map(entry => {
                      const subject = subjects.find(s => s.id === entry.subject_id);

                      return (
                        <div
                          key={entry.id}
                          className="p-space-sm rounded-xl bg-surface-container-lowest/60 border border-white/5 flex flex-col gap-1 group hover:bg-surface-container-high/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-label-data-md text-label-data-md text-primary font-semibold">
                              {entry.start_time} - {entry.end_time}
                            </span>
                            <div className="flex items-center gap-space-xs">
                              <span className="font-label-caps text-[10px] px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant">
                                {entry.class_type}
                              </span>
                              <button
                                onClick={() => openEditModal(entry)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded text-outline hover:text-on-surface transition-opacity"
                                title="Edit Slot"
                              >
                                <span className="material-symbols-outlined text-[14px]">edit</span>
                              </button>
                              <button
                                onClick={() => deleteTimetableEntry(entry.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded text-error/60 hover:text-error transition-opacity"
                                title="Delete Slot"
                              >
                                <span className="material-symbols-outlined text-[14px]">delete</span>
                              </button>
                            </div>
                          </div>

                          <div className="font-title-sm text-title-sm text-on-surface font-medium truncate">
                            {subject?.name || 'General Module'}
                          </div>

                          <div className="flex items-center justify-between text-body-sm text-outline font-body-sm">
                            <span>{subject?.code || 'CS-101'}</span>
                            <span>{entry.room || 'Room TBA'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEntry ? 'Edit Class Slot' : 'Add Class to Timetable'}
        subtitle="Specify subject, day of week, timings, and classroom location"
      >
        <form onSubmit={handleSaveClass} className="flex flex-col gap-space-md">
          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">
              Subject *
            </label>
            <select
              required
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 border border-white/10 text-on-surface font-body-md focus:outline-none focus:border-primary"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id} className="bg-surface-container text-on-surface">
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">
                Day of Week *
              </label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(Number(e.target.value))}
                className="w-full px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 border border-white/10 text-on-surface font-body-md focus:outline-none focus:border-primary"
              >
                {days.map(d => (
                  <option key={d.num} value={d.num} className="bg-surface-container text-on-surface">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">
                Class Type
              </label>
              <select
                value={classType}
                onChange={e => setClassType(e.target.value as ClassType)}
                className="w-full px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 border border-white/10 text-on-surface font-body-md focus:outline-none focus:border-primary"
              >
                <option value="Lecture" className="bg-surface-container text-on-surface">Lecture (Theory)</option>
                <option value="Lab" className="bg-surface-container text-on-surface">Practical Lab</option>
                <option value="Tutorial" className="bg-surface-container text-on-surface">Tutorial</option>
                <option value="Activity" className="bg-surface-container text-on-surface">Mentorship / Activity</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 border border-white/10 text-on-surface font-label-data-md focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 border border-white/10 text-on-surface font-label-data-md focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase block mb-1">
                Room / Lab
              </label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. Room 302"
                className="w-full px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 border border-white/10 text-on-surface font-body-md focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="pt-space-md border-t border-white/5 flex items-center justify-end gap-space-sm">
            <GlassButton variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" type="submit">
              {editingEntry ? 'Update Slot' : 'Save Slot'}
            </GlassButton>
          </div>
        </form>
      </Modal>

    </div>
  );
};
