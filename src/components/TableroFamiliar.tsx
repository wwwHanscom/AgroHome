"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./TableroFamiliar.module.css";

type Assignment = {
  member: string;
  activity: string;
};

const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const defaultHours = Array.from({ length: 19 }, (_, index) => {
  const hour = index + 5;
  const hourLabel = hour > 12 ? hour - 12 : hour;
  const period = hour >= 12 ? "p. m." : "a. m.";
  return `${hourLabel}:00 ${period}`;
});

const emptyAssignments: Record<string, Assignment> = {};

function parseHourToMinutes(value: string): number | null {
  const normalized = value.trim().toLowerCase();
  const timeMatch = normalized.match(/^([+-]?\d+):(\d{2})/);
  if (!timeMatch) return null;

  const hourSign = timeMatch[1].startsWith("-") ? -1 : 1;
  let hour = Math.abs(Number(timeMatch[1]));
  const minutes = Number(timeMatch[2]);
  if (minutes > 59) return null;

  const dayOffsetMatch = normalized.match(/\(([+-]\d+)\s*d[ií]a[s]?\)/);
  const dayOffset = dayOffsetMatch ? Number(dayOffsetMatch[1]) : 0;

  if (/p\s*\.?\s*m/i.test(normalized)) {
    if (hour > 0 && hour <= 12) {
      if (hour === 12) hour = 0;
      hour += 12;
    }
  } else if (/a\s*\.?\s*m/i.test(normalized)) {
    if (hour === 12) hour = 0;
  }

  return hourSign * (hour * 60 + minutes) + dayOffset * 1440;
}

function padItems(items: string[], minCount: number, isPrinting: boolean): string[] {
  if (!isPrinting || items.length >= minCount) return items;
  return [...items, ...Array.from({ length: minCount - items.length }, () => "")];
}

export function TableroFamiliar() {
  const [members, setMembers] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [chores, setChores] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Record<string, Assignment>>(emptyAssignments);
  const [hours, setHours] = useState<string[]>(defaultHours);
  const [hourFormat, setHourFormat] = useState<"12" | "24">("12");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [memberInput, setMemberInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [choreInput, setChoreInput] = useState("");
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; key: string } | null>(null);
  const [rowMenu, setRowMenu] = useState<{ x: number; y: number; index: number } | null>(null);
  const [copiedAssignment, setCopiedAssignment] = useState<Assignment | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [selectionAnchor, setSelectionAnchor] = useState<string | null>(null);
  const isSelectingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const dragStartRef = useRef<string | null>(null);
  const suppressClickRef = useRef(false);
  type TableSnapshot = {
    hours: string[];
    assignments: Record<string, Assignment>;
  };

  const [tableHistory, setTableHistory] = useState<TableSnapshot[]>([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [activity, setActivity] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;

      const key = event.key.toLowerCase();
      if (!["c", "v", "x", "z"].includes(key)) return;
      event.preventDefault();

      if (key === "z") {
        setTableHistory((history) => {
          if (history.length === 0) return history;
          const previous = history[history.length - 1];
          setHours(previous.hours);
          setAssignments(previous.assignments);
          return history.slice(0, -1);
        });
        return;
      }

      if (key === "c") {
        if (!selectedCells.size) return;
        const firstKey = Array.from(selectedCells)[0];
        setCopiedAssignment(assignments[firstKey] ? { ...assignments[firstKey] } : null);
        return;
      }

      if (key === "x") {
        if (!selectedCells.size) return;
        if (!copiedAssignment) {
          const firstKey = Array.from(selectedCells)[0];
          if (assignments[firstKey]) setCopiedAssignment({ ...assignments[firstKey] });
        }

        setTableHistory((history) => [...history, { hours: [...hours], assignments: { ...assignments } }]);
        setAssignments((current) => {
          const next = { ...current };
          selectedCells.forEach((cellKey) => delete next[cellKey]);
          return next;
        });
        setSelectedCells(new Set());
        setSelectionAnchor(null);
        return;
      }

      if (key === "v" && copiedAssignment) {
        if (!selectedCells.size) return;
        setTableHistory((history) => [...history, { hours: [...hours], assignments: { ...assignments } }]);
        setAssignments((current) => {
          const next = { ...current };
          selectedCells.forEach((cellKey) => {
            next[cellKey] = { ...copiedAssignment };
          });
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [assignments, copiedAssignment, selectedCells, selectionAnchor]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (!isSelectingRef.current) return;

      isSelectingRef.current = false;
      if (dragMovedRef.current) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }
      dragMovedRef.current = false;
      dragStartRef.current = null;
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem("agrohome-tablero");
    if (!saved) {
      setIsLoaded(true);
      return;
    }

    try {
      const data = JSON.parse(saved);
      setMembers(data.members ?? []);
      setNotes(data.notes ?? []);
      setChores(data.chores ?? []);
      setAssignments(data.assignments ?? {});
      setHours(data.hours ?? defaultHours);
    } catch {
      window.localStorage.removeItem("agrohome-tablero");
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(
      "agrohome-tablero",
      JSON.stringify({ members, notes, chores, assignments, hours })
    );
  }, [members, notes, chores, assignments, hours, isLoaded]);

  const handlePrint = () => {
    setIsPrinting(true);
    requestAnimationFrame(() => {
      window.print();
    });
  };

  const addItem = (
    event: FormEvent<HTMLFormElement>,
    value: string,
    setValue: (value: string) => void,
    setItems: (updater: (items: string[]) => string[]) => void
  ) => {
    event.preventDefault();
    const item = value.trim();
    if (!item) return;
    setItems((items) => [...items, item]);
    setValue("");
  };

  const parseCellKey = (key: string) => {
    const [dayIndex, hourIndex] = key.split("-").map(Number);
    return { dayIndex, hourIndex };
  };

  const handleCellClick = (event: React.MouseEvent<HTMLButtonElement>, key: string) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();

      if (!selectionAnchor) {
        setSelectionAnchor(key);
        setSelectedCells(new Set([key]));
        return;
      }

      const start = parseCellKey(selectionAnchor);
      const end = parseCellKey(key);
      const next = new Set<string>();

      for (let dayIndex = Math.min(start.dayIndex, end.dayIndex); dayIndex <= Math.max(start.dayIndex, end.dayIndex); dayIndex++) {
        for (let hourIndex = Math.min(start.hourIndex, end.hourIndex); hourIndex <= Math.max(start.hourIndex, end.hourIndex); hourIndex++) {
          next.add(`${dayIndex}-${hourIndex}`);
        }
      }

      setSelectedCells(next);
      return;
    }

    setSelectedCells(new Set());
    setSelectionAnchor(null);
    openCell(key);
  };

  const handleCellMouseDown = (event: React.MouseEvent<HTMLButtonElement>, key: string) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey) return;

    isSelectingRef.current = true;
    dragMovedRef.current = false;
    dragStartRef.current = key;
  };

  const handleCellMouseEnter = (key: string) => {
    if (!isSelectingRef.current) return;

    dragMovedRef.current = true;
    const startKey = dragStartRef.current;

    setSelectedCells((current) => {
      const next = new Set(current);
      if (startKey) next.add(startKey);
      next.add(key);
      return next;
    });
  };

  const handleCellMouseUp = () => {
    if (!isSelectingRef.current) return;

    isSelectingRef.current = false;
    if (dragMovedRef.current) {
      suppressClickRef.current = true;
    }
    dragStartRef.current = null;
  };

  const openContextMenu = (event: React.MouseEvent<HTMLButtonElement>, key: string) => {
    event.preventDefault();
    setSelectedCells((current) => current.has(key) ? current : new Set([key]));
    setSelectionAnchor(key);
    setContextMenu({ x: event.clientX, y: event.clientY, key });
  };

  const closeContextMenu = () => setContextMenu(null);

  const copyAssignment = () => {
    if (!contextMenu) return;
    setCopiedAssignment(assignments[contextMenu.key] ?? null);
    closeContextMenu();
  };

  const pasteAssignment = () => {
    if (!contextMenu || !copiedAssignment) return;

    const targetCells = selectedCells.size > 0
      ? selectedCells
      : new Set([contextMenu.key]);

    setTableHistory((history) => [...history, { hours: [...hours], assignments: { ...assignments } }]);
    setAssignments((current) => {
      const next = { ...current };
      targetCells.forEach((key) => {
        next[key] = { ...copiedAssignment };
      });
      return next;
    });
    closeContextMenu();
  };

  const deleteAssignment = () => {
    if (!contextMenu) return;

    const targetCells = selectedCells.size > 0
      ? selectedCells
      : new Set([contextMenu.key]);

    const emptyRowIndexes = new Set<number>();

    targetCells.forEach((key) => {
      if (!assignments[key]) {
        const [, hourIndexText] = key.split("-");
        emptyRowIndexes.add(Number(hourIndexText));
      }
    });

    setTableHistory((history) => [...history, { hours: [...hours], assignments: { ...assignments } }]);

    if (emptyRowIndexes.size > 0) {
      setHours((current) => {
        const rowIndexes = [...emptyRowIndexes].sort((a, b) => b - a);
        const remaining = [...current];
        rowIndexes.forEach((index) => remaining.splice(index, 1));
        return remaining;
      });

      setAssignments((current) => {
        const next: Record<string, Assignment> = {};
        const removedIndexes = [...emptyRowIndexes].sort((a, b) => a - b);

        Object.entries(current).forEach(([key, assignment]) => {
          const [dayIndex, hourIndex] = key.split("-").map(Number);
          if (emptyRowIndexes.has(hourIndex)) return;

          const removedBefore = removedIndexes.filter((index) => index < hourIndex).length;
          next[`${dayIndex}-${hourIndex - removedBefore}`] = assignment;
        });

        targetCells.forEach((key) => {
          if (!emptyRowIndexes.has(Number(key.split("-")[1]))) delete next[key];
        });

        return next;
      });
    } else {
      setAssignments((current) => {
        const next = { ...current };
        targetCells.forEach((key) => delete next[key]);
        return next;
      });
    }

    setSelectedCells(new Set());
    setSelectionAnchor(null);
    closeContextMenu();
  };

  const openCell = (key: string) => {
    setActiveCell(key);
    const assignment = assignments[key];
    setSelectedMember(assignment?.member ?? "");
    setActivity(assignment?.activity ?? "");
    dialogRef.current?.showModal();
  };

  const closeAndSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeCell) return;

    const memberName = selectedMember.trim();
    const activityName = activity.trim();

    if (!memberName || !activityName) return;

    if (!members.includes(memberName)) {
      setMembers((current) => [...current, memberName]);
    }

    if (!chores.includes(activityName)) {
      setChores((current) => [...current, activityName]);
    }

    setAssignments((current) => ({
      ...current,
      [activeCell]: { member: memberName, activity: activityName },
    }));
    dialogRef.current?.close();
  };

  const resetTable = () => {
    setHours([...defaultHours]);
    setAssignments({});
    setActiveCell(null);
    setSelectedMember("");
    setActivity("");
  };

  const addHourRow = () => {
    setHours((current) => {
      const lastHour = current.at(-1);
      const lastMinutes = lastHour ? parseHourToMinutes(lastHour) : null;
      if (lastMinutes === null) return [...current, "1:00 p. m."];
      return [...current, formatHour(lastMinutes + 60, hourFormat)];
    });
  };

  const updateHour = (index: number, value: string) => {
    setHours((current) => current.map((hour, hourIndex) => (hourIndex === index ? value : hour)));
  };

  const formatHour = (minutesOfDay: number, format: "12" | "24"): string => {
    const absoluteMinutes = Math.abs(minutesOfDay);
    const sign = minutesOfDay < 0 ? "-" : "";
    const totalHours = Math.floor(absoluteMinutes / 60);
    const minutes = absoluteMinutes % 60;

    if (format === "24") return `${sign}${String(totalHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    const dayOffset = Math.floor(minutesOfDay / 1440);
    const safeMinutes = ((minutesOfDay % 1440) + 1440) % 1440;
    const hour24 = Math.floor(safeMinutes / 60);
    const period = hour24 >= 12 ? "p. m." : "a. m.";
    const hour12 = hour24 % 12 || 12;
    const dayLabel = dayOffset === 0 ? "" : ` (${dayOffset > 0 ? "+" : ""}${dayOffset} ${Math.abs(dayOffset) === 1 ? "día" : "días"})`;

    return `${hour12}:${String(minutes).padStart(2, "0")} ${period}${dayLabel}`;
  };

  const changeHourFormat = (format: "12" | "24") => {
    setHourFormat(format);
    setHours((current) => current.map((hour) => {
      const minutes = parseHourToMinutes(hour);
      return minutes === null ? hour : formatHour(minutes, format);
    }));
  };

  const openRowMenu = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    setRowMenu({ x: event.clientX, y: event.clientY, index });
  };

  const closeRowMenu = () => setRowMenu(null);

  const addRowAt = (position: number, direction: "above" | "below") => {
    setTableHistory((history) => [...history, { hours: [...hours], assignments: { ...assignments } }]);

    setHours((current) => {
      const next = [...current];
      let referenceMinutes: number;

      if (direction === "above") {
        const currentMinutes = parseHourToMinutes(current[position]);
        const previousMinutes = position > 0 ? parseHourToMinutes(current[position - 1]) : null;

        if (currentMinutes !== null && previousMinutes !== null) {
          referenceMinutes = previousMinutes + Math.round((currentMinutes - previousMinutes) / 2);
        } else if (currentMinutes !== null) {
          referenceMinutes = currentMinutes - 60;
        } else {
          referenceMinutes = 5 * 60;
        }
      } else {
        const currentMinutes = parseHourToMinutes(current[position - 1]);
        const nextMinutes = position < current.length ? parseHourToMinutes(current[position]) : null;

        if (currentMinutes !== null && nextMinutes !== null) {
          referenceMinutes = currentMinutes + Math.round((nextMinutes - currentMinutes) / 2);
        } else if (currentMinutes !== null) {
          referenceMinutes = currentMinutes + 60;
        } else {
          referenceMinutes = 5 * 60;
        }
      }

      next.splice(position, 0, formatHour(referenceMinutes, hourFormat));
      return next;
    });

    setAssignments((current) => {
      const next: Record<string, Assignment> = {};

      Object.entries(current).forEach(([key, assignment]) => {
        const [dayIndex, hourIndex] = key.split("-").map(Number);
        const adjustedHourIndex = hourIndex >= position ? hourIndex + 1 : hourIndex;
        next[`${dayIndex}-${adjustedHourIndex}`] = assignment;
      });

      return next;
    });

    closeRowMenu();
  };

  const removeHourRow = (indexToRemove: number) => {
    setTableHistory((history) => [...history, { hours: [...hours], assignments: { ...assignments } }]);
    setHours((current) => current.filter((_, index) => index !== indexToRemove));
    setAssignments((current) => {
      const next: Record<string, Assignment> = {};

      Object.entries(current).forEach(([key, assignment]) => {
        const [dayIndex, hourIndex] = key.split("-").map(Number);
        if (hourIndex === indexToRemove) return;

        const adjustedHourIndex = hourIndex > indexToRemove ? hourIndex - 1 : hourIndex;
        next[`${dayIndex}-${adjustedHourIndex}`] = assignment;
      });

      return next;
    });
  };

  const removeMember = (indexToRemove: number) => {
    const memberToRemove = members[indexToRemove];
    setMembers((current) => current.filter((_, index) => index !== indexToRemove));
    setAssignments((current) => {
      const next = { ...current };
      Object.entries(next).forEach(([key, assignment]) => {
        if (assignment.member === memberToRemove) {
          if (assignment.activity) {
            next[key] = { member: "", activity: assignment.activity };
          } else {
            delete next[key];
          }
        }
      });
      return next;
    });
  };

  const removeItem = (
    indexToRemove: number,
    setItems: (updater: (items: string[]) => string[]) => void
  ) => {
    setItems((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const clearAssignment = () => {
    if (!activeCell) return;
    setAssignments((current) => {
      const next = { ...current };
      delete next[activeCell];
      return next;
    });
    setSelectedMember("");
    setActivity("");
    dialogRef.current?.close();
  };

  const memberMinutes = (memberName: string): number => {
    let totalMinutes = 0;

    Object.entries(assignments).forEach(([key, assignment]) => {
      if (assignment.member !== memberName) return;

      const [, hourIndexText] = key.split("-");
      const hourIndex = Number(hourIndexText);
      const start = parseHourToMinutes(hours[hourIndex]);
      const end = parseHourToMinutes(hours[hourIndex + 1] ?? "");

      if (start !== null && end !== null && end > start) {
        totalMinutes += end - start;
      }
    });

    return totalMinutes;
  };

  const formatMemberHours = (memberName: string): string => {
    const totalMinutes = memberMinutes(memberName);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours} h ${minutes} min`;
  };

  const getMemberHourClass = (memberName: string): string => {
    const totalMinutes = memberMinutes(memberName);
    if (totalMinutes > 14 * 60) return styles.memberHoursRed;
    if (totalMinutes > 10 * 60 + 50) return styles.memberHoursYellow;
    return styles.memberHours;
  };

  const displayedMembers = padItems(members, 6, isPrinting);
  const displayedNotes = padItems(notes, 3, isPrinting);
  const displayedChores = padItems(chores, 5, isPrinting);

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brandHeader}>
          <img
            src="/img/AgroHome.png"
            alt="AgroHome"
            className={styles.printLogo}
          />
        </div>

        <section className={styles.card}>
          <h3>Miembros de tu familia</h3>
          <form
            className={`${styles.inlineForm} ${styles.noPrint}`}
            onSubmit={(event) => addItem(event, memberInput, setMemberInput, setMembers)}
          >
            <input
              value={memberInput}
              onChange={(event) => setMemberInput(event.target.value)}
              placeholder="Nombre del familiar..."
              required
            />
            <button type="submit" title="Agregar miembro">+</button>
          </form>
          <ol className={styles.numberedList}>
            {displayedMembers.map((member, index) => (
              <li key={`member-${index}`} className={!member ? styles.emptyRow : undefined}>
                <span>
                  {member}
                  {member && (
                    <strong className={`${styles.memberHours} ${getMemberHourClass(member)}`}>
                      {` - ${formatMemberHours(member)}`}
                    </strong>
                  )}
                </span>
                {member && (
                  <button
                    type="button"
                    className={`${styles.removeItemButton} ${styles.noPrint}`}
                    onClick={() => removeMember(index)}
                    aria-label={`Eliminar a ${member}`}
                    title={`Eliminar a ${member}`}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.card}>
          <h3>Otros</h3>
          <form
            className={`${styles.inlineForm} ${styles.noPrint}`}
            onSubmit={(event) => addItem(event, noteInput, setNoteInput, setNotes)}
          >
            <input
              value={noteInput}
              onChange={(event) => setNoteInput(event.target.value)}
              placeholder="Agregar nota o apoyo..."
              required
            />
            <button type="submit" title="Agregar">+</button>
          </form>
          <ol className={styles.numberedList}>
            {displayedNotes.map((note, index) => (
              <li key={`note-${index}`} className={!note ? styles.emptyRow : undefined}>
                <span>{note}</span>
                {note && (
                  <button
                    type="button"
                    className={`${styles.removeItemButton} ${styles.noPrint}`}
                    onClick={() => removeItem(index, setNotes)}
                    aria-label={`Eliminar ${note}`}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.card}>
          <h3>Labores domésticas</h3>
          <form
            className={`${styles.inlineForm} ${styles.noPrint}`}
            onSubmit={(event) => addItem(event, choreInput, setChoreInput, setChores)}
          >
            <input
              value={choreInput}
              onChange={(event) => setChoreInput(event.target.value)}
              placeholder="Nueva labor..."
              required
            />
            <button type="submit" title="Agregar labor">+</button>
          </form>
          <ol className={styles.numberedList}>
            {displayedChores.map((chore, index) => (
              <li key={`chore-${index}`} className={!chore ? styles.emptyRow : undefined}>
                <span>{chore}</span>
                {chore && (
                  <button
                    type="button"
                    className={`${styles.removeItemButton} ${styles.noPrint}`}
                    onClick={() => removeItem(index, setChores)}
                    aria-label={`Eliminar ${chore}`}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ol>
        </section>

        <div className={styles.printFooterBox}>
          Encuentra compradores y posibles inversionistas
        </div>

        <button
          type="button"
          className={`${styles.printButton} ${styles.noPrint}`}
          onClick={handlePrint}
        >
          Imprimir
        </button>
      </aside>

      <section className={styles.scheduleContainer} aria-label="Horario semanal">
        <div className={styles.tableWrapper}>
          <table className={styles.scheduleTable}>
            <thead>
              <tr>
                <th className={`${styles.removeColumn} ${styles.noPrint}`} aria-label="Eliminar fila"></th>
                <th className={styles.timeCol}>
                  <div className={styles.hourHeader}>
                    <span>Hora</span>
                    <select
                      className={styles.hourFormatSelect}
                      value={hourFormat}
                      onChange={(event) => changeHourFormat(event.target.value as "12" | "24")}
                      aria-label="Formato de hora"
                      title="Formato de hora"
                    >
                      <option value="12">12 h</option>
                      <option value="24">24 h</option>
                    </select>
                  </div>
                </th>
                {days.map((day) => <th key={day}>{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour, hourIndex) => (
                <tr key={`hour-row-${hourIndex}`}>
                  <td className={`${styles.removeColumn} ${styles.noPrint}`}>
                    <button
                      type="button"
                      className={styles.rowMenuButton}
                      onClick={(event) => openRowMenu(event, hourIndex)}
                      aria-label={`Opciones de la fila ${hour}`}
                      title="Opciones de fila"
                    >
                      ⋮
                    </button>
                  </td>
                  <th className={styles.timeCol}>
                    <input
                      className={`${styles.hourInput} ${styles.noPrint}`}
                      value={hour}
                      onChange={(event) => updateHour(hourIndex, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                      }}
                      aria-label={`Editar hora de la fila ${hourIndex + 1}`}
                    />
                    <span className={styles.printOnlyText}>{hour}</span>
                  </th>
                  {days.map((day, dayIndex) => {
                    const key = `${dayIndex}-${hourIndex}`;
                    const assignment = assignments[key];
                    return (
                      <td key={key}>
                        <button
                          type="button"
                          className={`${styles.cellButton} ${selectedCells.has(key) ? styles.selectedCell : ""}`}
                          onClick={(event) => handleCellClick(event, key)}
                          onMouseDown={(event) => handleCellMouseDown(event, key)}
                          onMouseEnter={() => handleCellMouseEnter(key)}
                          onMouseUp={handleCellMouseUp}
                          onContextMenu={(event) => openContextMenu(event, key)}
                          aria-label={`Asignar ${day} a las ${hour}`}
                        >
                          {assignment && (
                            <span className={styles.assignment}>
                              {assignment.member && <strong>{assignment.member}</strong>}
                              {assignment.activity && <small>{assignment.activity}</small>}
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={`${styles.tableToolbar} ${styles.noPrint}`}>
          <button
            type="button"
            className={styles.resetTableButton}
            onClick={resetTable}
          >
            Restablecer tabla
          </button>
          <button
            type="button"
            className={styles.addRowButton}
            onClick={addHourRow}
          >
            + Agregar fila
          </button>
        </div>
      </section>

      {rowMenu && (
        <div
          className={styles.rowMenu}
          style={{ left: rowMenu.x, top: rowMenu.y }}
          role="menu"
        >
          <button type="button" role="menuitem" onClick={() => addRowAt(rowMenu.index, "above")}>Agregar fila superior</button>
          <button type="button" role="menuitem" onClick={() => addRowAt(rowMenu.index + 1, "below")}>Agregar fila inferior</button>
          <button type="button" role="menuitem" onClick={() => { removeHourRow(rowMenu.index); closeRowMenu(); }}>Eliminar fila</button>
        </div>
      )}

      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
          onMouseLeave={closeContextMenu}
        >
          <button type="button" role="menuitem" onClick={copyAssignment}>Copiar</button>
          <button type="button" role="menuitem" onClick={pasteAssignment} disabled={!copiedAssignment}>Pegar</button>
          <button type="button" role="menuitem" onClick={deleteAssignment}>Eliminar</button>
        </div>
      )}

      <dialog ref={dialogRef} className={`${styles.cellModal} ${styles.noPrint}`}>
        <form onSubmit={closeAndSave}>
          <div className={styles.modalHeader}>
            <h4>Asignar actividad</h4>
            <button
              type="button"
              className={styles.modalCloseButton}
              onClick={() => dialogRef.current?.close()}
              aria-label="Cerrar cuadro"
              title="Cerrar">
              ×
            </button>
          </div>

          <label>
            Responsable:
            <input
              list="lista-miembros-modal"
              value={selectedMember}
              onChange={(event) => setSelectedMember(event.target.value)}
              placeholder="Seleccionar o escribir familiar..."
              autoComplete="off"
              required
            />
            <datalist id="lista-miembros-modal">
              {members.map((member) => <option key={member} value={member} />)}
            </datalist>
          </label>

          <label>
            Labor / Actividad:
            <input
              list="lista-labores-modal"
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
              placeholder="Seleccionar o escribir labor..."
              autoComplete="off"
              required
            />
            <datalist id="lista-labores-modal">
              {chores.map((chore) => <option key={chore} value={chore} />)}
            </datalist>
          </label>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnSecondary} onClick={clearAssignment}>Eliminar</button>
            <button type="submit" className={styles.btnPrimary}>Guardar</button>
          </div>
        </form>
      </dialog>
    </main>
  );
}