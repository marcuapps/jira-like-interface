"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sprint, Epic } from "@/lib/types";
import {
  getStartOfWeek,
  getEndOfWeek,
  getDaysInQuarter,
  getDayOfQuarter,
  normalizeDate,
} from "@/utils/dateUtils";
import DayTilesRow from "../DayTilesRow";
import { Plus } from "lucide-react";
import EpicNameTextInput from "./EpicNameTextInput";
import { TimeUnit } from "@/lib/types";
import TimelineControls from "./TimelineControls";
import { isCurrentTimeUnit } from "@/utils/positionUtils";

interface ScrollableTimelineViewProps {
  sprints: Sprint[];
  onCreateEpic?: (sprintId: string, name: string) => void;
  onUpdateEpic?: (epicId: string, updates: Partial<Epic>) => void;
  onDeleteEpic?: (epicId: string) => void;
}

const ScrollableTimeline: React.FC<ScrollableTimelineViewProps> = ({
  sprints,
  onCreateEpic,
  onUpdateEpic,
  onDeleteEpic,
}) => {
  // Get today's date
  const today = new Date();

  // Default visible range: 1 year back, 2 years forward
  const defaultStartDate = new Date(today);
  defaultStartDate.setFullYear(today.getFullYear() - 1);

  const defaultEndDate = new Date(today);
  defaultEndDate.setFullYear(today.getFullYear() + 2);

  const [inputValue, setInputValue] = useState("");
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("Months");
  const [visibleStartDate, setVisibleStartDate] = useState<Date>(
    new Date(defaultStartDate)
  );
  const [visibleEndDate, setVisibleEndDate] = useState<Date>(
    new Date(defaultEndDate)
  );
  const [timeColumns, setTimeColumns] = useState<Date[]>([]);
  const [draggingEpic, setDraggingEpic] = useState<string | null>(null);
  const [resizingEpic, setResizingEpic] = useState<{
    id: string;
    edge: "left" | "right";
  } | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; date: Date } | null>(
    null
  );
  const [currentHoverSprint, setCurrentHoverSprint] = useState<string | null>(
    null
  );
  const [draggedItemOriginalDates, setDraggedItemOriginalDates] = useState<{
    id: string;
    startDate: Date;
    endDate: Date;
  } | null>(null);
  const [textInputIsVisible, setTextInputIsVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const allEpics = sprints.flatMap((sprint) => sprint.epics || []);

  // Set the date range only once, in a separate useEffect that runs only on component mount
  useEffect(() => {
    const fixedStartDate = new Date(today);
    fixedStartDate.setFullYear(today.getFullYear() - 1);

    const fixedEndDate = new Date(today);
    fixedEndDate.setFullYear(today.getFullYear() + 2);

    setVisibleStartDate(fixedStartDate);
    setVisibleEndDate(fixedEndDate);
  }, []);

  // Then, in a separate useEffect, generate the columns based on the date range and time unit
  useEffect(() => {
    if (!visibleStartDate || !visibleEndDate) return;

    const columns: Date[] = [];

    if (timeUnit === "Quarters") {
      // Start at the beginning of the quarter
      let current = new Date(visibleStartDate);
      const quarterMonth = Math.floor(current.getMonth() / 3) * 3;
      current = new Date(current.getFullYear(), quarterMonth, 1);

      // Generate quarter columns
      while (current <= visibleEndDate) {
        columns.push(new Date(current));
        current.setMonth(current.getMonth() + 3);
      }
    } else {
      const current = new Date(visibleStartDate);

      while (current <= visibleEndDate) {
        columns.push(new Date(current));

        switch (timeUnit) {
          case "Weeks":
            current.setDate(current.getDate() + 7);
            break;
          case "Months":
            current.setMonth(current.getMonth() + 1);
            break;
        }
      }
    }
    setTimeColumns(columns);
  }, [timeUnit, visibleStartDate, visibleEndDate]);

  useEffect(() => {
    if (timeColumns.length > 0) {
      scrollToToday();
    }
  }, [timeColumns, timeUnit]);

  // Fixed width for all time units
  const columnWidth = 200;

  const getColumnWidth = () => {
    return columnWidth;
  };

  // Get total timeline width
  const getTimelineWidth = () => {
    return timeColumns.length * getColumnWidth();
  };

  const scrollToToday = () => {
    // Wait for the timeline to be rendered and columns to be generated
    setTimeout(() => {
      if (!timelineRef.current || timeColumns.length === 0) return;

      // Find position of today based on the current time unit
      let todayPosition = 0;

      if (timeUnit === "Months") {
        // Find which month column today belongs to
        const monthIndex = timeColumns.findIndex(
          (col) =>
            col.getMonth() === today.getMonth() &&
            col.getFullYear() === today.getFullYear()
        );

        if (monthIndex !== -1) {
          todayPosition = monthIndex * columnWidth;
        }
      } else if (timeUnit === "Weeks") {
        // For week view, find the week that contains today
        const weekIndex = timeColumns.findIndex((col) => {
          // Create date range for the week
          const weekStart = new Date(col);
          const weekEnd = new Date(col);
          weekEnd.setDate(weekEnd.getDate() + 6);

          return today >= weekStart && today <= weekEnd;
        });

        if (weekIndex !== -1) {
          todayPosition = weekIndex * columnWidth;
        }
      } else if (timeUnit === "Quarters") {
        // For quarter view
        const todayQuarter = Math.floor(today.getMonth() / 3);
        const todayYear = today.getFullYear();

        const quarterIndex = timeColumns.findIndex((col) => {
          const colQuarter = Math.floor(col.getMonth() / 3);
          const colYear = col.getFullYear();

          return colQuarter === todayQuarter && colYear === todayYear;
        });

        if (quarterIndex !== -1) {
          todayPosition = quarterIndex * columnWidth;
        }
      }

      // Scroll to center today's position
      const container = timelineRef.current;
      const containerWidth = container.clientWidth;
      container.scrollLeft = todayPosition - containerWidth / 6;
    }, 100);
  };

  const pixelToDate = (pixel: number): Date => {
    if (!containerRef.current || timeColumns.length === 0) return new Date();

    const totalTimeRange =
      visibleEndDate.getTime() - visibleStartDate.getTime();
    const scrollOffset = timelineRef.current?.scrollLeft || 0;

    const adjustedPixel = pixel + scrollOffset;
    const percentage = adjustedPixel / getTimelineWidth();
    const millisecondOffset = percentage * totalTimeRange;

    const exactDate = new Date(visibleStartDate.getTime() + millisecondOffset);

    return exactDate;
  };

  const calculateItemStyle = (itemStart: Date, itemEnd: Date) => {
    if (!containerRef.current || timeColumns.length === 0) return {};

    // Normalize dates to midnight
    const normalizedStart = normalizeDate(itemStart);
    const normalizedEnd = normalizeDate(itemEnd);

    if (timeUnit === "Quarters") {
      let startColumnIndex = -1;
      let endColumnIndex = -1;

      for (let i = 0; i < timeColumns.length; i++) {
        const quarterStart = new Date(timeColumns[i]);
        const quarterEnd = new Date(timeColumns[i]);
        quarterEnd.setMonth(quarterEnd.getMonth() + 3);
        quarterEnd.setDate(quarterEnd.getDate() - 1);

        // Check if item start falls in this quarter
        if (normalizedStart >= quarterStart && normalizedStart <= quarterEnd) {
          startColumnIndex = i;
        }

        // Check if item end falls in this quarter
        if (normalizedEnd >= quarterStart && normalizedEnd <= quarterEnd) {
          endColumnIndex = i;
        }
      }

      // If no match found, use closest
      if (startColumnIndex === -1) startColumnIndex = 0;
      if (endColumnIndex === -1) endColumnIndex = timeColumns.length - 1;

      // Calculate position within quarter
      let startOffset = 0;
      let endOffset = columnWidth;

      if (startColumnIndex >= 0) {
        const quarterStart = timeColumns[startColumnIndex];
        const daysInQuarter = getDaysInQuarter(
          quarterStart.getFullYear(),
          Math.floor(quarterStart.getMonth() / 3)
        );
        const dayOfQuarter = getDayOfQuarter(normalizedStart);
        startOffset = (dayOfQuarter / daysInQuarter) * columnWidth;
      }

      if (endColumnIndex >= 0) {
        const quarterStart = timeColumns[endColumnIndex];
        const daysInQuarter = getDaysInQuarter(
          quarterStart.getFullYear(),
          Math.floor(quarterStart.getMonth() / 3)
        );
        const dayOfQuarter = getDayOfQuarter(normalizedEnd);
        endOffset = (dayOfQuarter / daysInQuarter) * columnWidth;
      }

      // Calculate final position
      const left = startColumnIndex * columnWidth + startOffset;
      const right = endColumnIndex * columnWidth + endOffset;

      return {
        left: `${left}px`,
        width: `${Math.max(right - left, 50)}px`, // Minimum width
      };
    }

    let startColumnIndex = -1;
    let endColumnIndex = -1;

    for (let i = 0; i < timeColumns.length; i++) {
      const columnDate = normalizeDate(timeColumns[i]);

      if (timeUnit === "Months") {
        if (
          columnDate.getMonth() === normalizedStart.getMonth() &&
          columnDate.getFullYear() === normalizedStart.getFullYear()
        ) {
          startColumnIndex = i;
        }

        if (
          columnDate.getMonth() === normalizedEnd.getMonth() &&
          columnDate.getFullYear() === normalizedEnd.getFullYear()
        ) {
          endColumnIndex = i;
        }
      } else if (timeUnit === "Weeks") {
        const weekStart = normalizeDate(getStartOfWeek(timeColumns[i]));
        const weekEnd = normalizeDate(getEndOfWeek(timeColumns[i]));

        if (normalizedStart >= weekStart && normalizedStart <= weekEnd) {
          startColumnIndex = i;
        }

        if (normalizedEnd >= weekStart && normalizedEnd <= weekEnd) {
          endColumnIndex = i;
        }
      }
    }

    // If columns weren't found, use closest approximation
    if (startColumnIndex === -1) startColumnIndex = 0;
    if (endColumnIndex === -1) endColumnIndex = timeColumns.length - 1;

    let startOffset = 0;
    let endOffset = columnWidth;

    if (timeUnit === "Months") {
      // Calculate day position within the month
      const daysInMonth = new Date(
        normalizedStart.getFullYear(),
        normalizedStart.getMonth() + 1,
        0
      ).getDate();
      startOffset =
        ((normalizedStart.getDate() - 1) / daysInMonth) * columnWidth;

      const endDaysInMonth = new Date(
        normalizedEnd.getFullYear(),
        normalizedEnd.getMonth() + 1,
        0
      ).getDate();
      endOffset = (normalizedEnd.getDate() / endDaysInMonth) * columnWidth;
    } else if (timeUnit === "Weeks") {
      // Calculate day position within the week (0-6)
      const dayOfWeek =
        normalizedStart.getDay() === 0 ? 6 : normalizedStart.getDay() - 1;
      startOffset = (dayOfWeek / 7) * columnWidth;

      const endDayOfWeek =
        normalizedEnd.getDay() === 0 ? 6 : normalizedEnd.getDay() - 1;
      endOffset = ((endDayOfWeek + 1) / 7) * columnWidth; // +1 to include the full end day
    }

    // Calculate final position and width
    const left = startColumnIndex * columnWidth + startOffset;
    const right = endColumnIndex * columnWidth + endOffset;

    return {
      left: `${left}px`,
      width: `${Math.max(right - left, 50)}px`,
    };
  };

  const calculateTodayPosition = () => {
    if (!visibleStartDate || !visibleEndDate || timeColumns.length === 0)
      return null;

    // Check if today is within the visible range
    if (today < visibleStartDate || today > visibleEndDate) return null;

    if (timeUnit === "Quarters") {
      for (let i = 0; i < timeColumns.length; i++) {
        const quarterStart = new Date(timeColumns[i]);
        const quarterEnd = new Date(timeColumns[i]);
        quarterEnd.setMonth(quarterEnd.getMonth() + 3);
        quarterEnd.setDate(quarterEnd.getDate() - 1);

        if (today >= quarterStart && today <= quarterEnd) {
          // Calculate position within the quarter
          const totalDaysInQuarter = getDaysInQuarter(
            quarterStart.getFullYear(),
            Math.floor(quarterStart.getMonth() / 3)
          );
          const dayOfQuarter = getDayOfQuarter(today);

          const position =
            i * columnWidth + (dayOfQuarter / totalDaysInQuarter) * columnWidth;
          return `${position}px`;
        }
      }
    } else if (timeUnit === "Months") {
      // Find which month column today belongs to
      for (let i = 0; i < timeColumns.length; i++) {
        const columnDate = timeColumns[i];

        if (
          columnDate.getMonth() === today.getMonth() &&
          columnDate.getFullYear() === today.getFullYear()
        ) {
          const daysInMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          ).getDate();
          const position =
            i * columnWidth + (today.getDate() / daysInMonth) * columnWidth;
          return `${position}px`;
        }
      }
    }

    // For weekly view
    if (timeUnit === "Weeks") {
      // Find which week column today belongs to
      for (let i = 0; i < timeColumns.length; i++) {
        const columnDate = new Date(timeColumns[i]);

        const weekStart = getStartOfWeek(columnDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        // Check if today falls within this week
        if (today >= weekStart && today <= weekEnd) {
          const daysSinceWeekStart = Math.floor(
            (today.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000)
          );

          const position =
            i * columnWidth + (daysSinceWeekStart / 7) * columnWidth + 20;
          return `${position}px`;
        }
      }
    }

    // Fallback to approximation if we couldn't find the exact column
    const totalDuration = visibleEndDate.getTime() - visibleStartDate.getTime();
    const todayOffset =
      (today.getTime() - visibleStartDate.getTime()) / totalDuration;
    return `${todayOffset * getTimelineWidth()}px`;
  };

  // Find which sprint row we're currently hovering over
  const findEpicFromY = (y: number): string | null => {
    const epicRows = document.querySelectorAll(".sprint-row");
    for (let i = 0; i < epicRows.length; i++) {
      const row = epicRows[i];
      const rect = row.getBoundingClientRect();
      if (y >= rect.top && y <= rect.bottom) {
        return row.getAttribute("data-sprint-id");
      }
    }
    return null;
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!dragStart || !draggedItemOriginalDates) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const scrollOffset = timelineRef.current?.scrollLeft || 0;
    const currentX = event.clientX - containerRect.left + scrollOffset;

    // Get exact date at current mouse position
    const currentDate = pixelToDate(currentX - scrollOffset);
    console.log("This is current date: " + dragStart.date);

    // Calculate the date difference from the ORIGINAL drag start point
    const dateDiffMs = currentDate.getTime() - dragStart.date.getTime();
    const daysDiff = Math.round(dateDiffMs / (24 * 60 * 60 * 1000));

    const hoveredEpic = findEpicFromY(event.clientY);
    if (hoveredEpic !== currentHoverSprint) {
      setCurrentHoverSprint(hoveredEpic);
    }

    if (draggingEpic) {
      // Original dates from when drag started
      const originalStartDate = draggedItemOriginalDates.startDate;
      const originalEndDate = draggedItemOriginalDates.endDate;

      // Create new dates by adding days difference to ORIGINAL dates
      const newStartDate = new Date(originalStartDate);
      newStartDate.setDate(originalStartDate.getDate() + daysDiff);

      const newEndDate = new Date(originalEndDate);
      newEndDate.setDate(originalEndDate.getDate() + daysDiff);

      // Update the epic
      if (onUpdateEpic) {
        onUpdateEpic(draggingEpic, {
          startDate: newStartDate,
          endDate: newEndDate,
        });
      }
    }

    if (resizingEpic) {
      const originalStartDate = draggedItemOriginalDates.startDate;
      const originalEndDate = draggedItemOriginalDates.endDate;

      if (resizingEpic.edge === "left") {
        const newStartDate = new Date(originalStartDate);
        newStartDate.setDate(originalStartDate.getDate() + daysDiff);

        if (newStartDate < originalEndDate) {
          onUpdateEpic &&
            onUpdateEpic(resizingEpic.id, { startDate: newStartDate });
        }
      } else {
        const newEndDate = new Date(originalEndDate);
        newEndDate.setDate(originalEndDate.getDate() + daysDiff);

        if (newEndDate > originalStartDate) {
          onUpdateEpic &&
            onUpdateEpic(resizingEpic.id, { endDate: newEndDate });
        }
      }
    }
  };

  // Handle mouse up (end drag/resize)
  const handleMouseUp = () => {
    setDraggingEpic(null);
    setResizingEpic(null);
    setDragStart(null);
    setDraggedItemOriginalDates(null);
    setCurrentHoverSprint(null);
  };

  // Format column date based on time unit
  const formatColumnDate = (date: Date) => {
    switch (timeUnit) {
      case "Weeks":
        return `${date
          .toLocaleDateString('en-us', { month: "short" })
          .toUpperCase()}`;
      case "Months":
        return date
          .toLocaleDateString('en-us', { month: "short" })
          .toUpperCase();
      case "Quarters":
        const quarter = Math.floor(date.getMonth() / 3);

        // Format as month ranges
        switch (quarter) {
          case 0:
            return "JAN - MAR";
          case 1:
            return "APR - JUN";
          case 2:
            return "JUL - SEP";
          case 3:
            return "OCT - DEC";
          default:
            return "";
        }
    }
  };

  const handleEpicMouseDown = (
    event: React.MouseEvent,
    epicId: string,
    edge: "left" | "right" | "center"
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const scrollOffset = timelineRef.current?.scrollLeft || 0;
    const clickX = event.clientX - containerRect.left + scrollOffset;
    const clickDate = pixelToDate(clickX - scrollOffset);

    const epic = allEpics.find((e) => e.id === epicId);
    if (!epic) return;

    setDraggedItemOriginalDates({
      id: epicId,
      startDate: new Date(epic.startDate),
      endDate: new Date(epic.endDate),
    });

    // Set drag start point
    setDragStart({ x: clickX, date: clickDate });

    if (edge === "left" || edge === "right") {
      setResizingEpic({ id: epicId, edge });
    } else {
      setDraggingEpic(epicId);
    }
  };

  const handlePlacingEpicMouseMove = (
    event: React.MouseEvent,
    epicId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const scrollOffset = timelineRef.current?.scrollLeft || 0;
    const currentX = event.clientX - containerRect.left + scrollOffset;

    // Get exact date at current mouse position
    const currentDate = pixelToDate(currentX - scrollOffset);

    const newStartDate = new Date();
    newStartDate.setDate(currentDate.getDate() - 10);

    const newEndDate = new Date();
    newEndDate.setDate(currentDate.getDate() + 10);

    console.log(newStartDate, newEndDate);

    // Update the epic
    if (onUpdateEpic) {
      onUpdateEpic(epicId, {
        startDate: newStartDate,
        endDate: newEndDate,
      });
    }
  };

  const handleClickOnEpicRow = (event: React.MouseEvent, epicId: string) => {
    event.preventDefault();
    event.stopPropagation();

    if (onUpdateEpic) {
      onUpdateEpic(epicId, {
        isPlaced: true,
      });
    }
  };

  const handleEnterPress = (value: string) => {
    onCreateEpic && onCreateEpic(sprints[0].id, value);
    setInputValue("");
    setTextInputIsVisible(false);
  };

  return (
    <div className="flex flex-col border border-gray-200 rounded h-[500px]">
      <div
        className="flex-grow overflow-x-auto"
        ref={timelineRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div style={{ width: `${getTimelineWidth()}px` }}>
          {/* Headers that scroll with content */}
          <div className="flex border-b border-gray-200">
            {/* Fixed left sidebar */}
            <div className="flex-shrink-0 w-96 border-r border-gray-200 bg-white sticky left-0 z-20">
              <div className="h-8"></div>
            </div>

            {/* Scrollable time columns */}
            <div className="flex-grow">
              <div className="flex">
                {timeColumns.map((column, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 text-center border-r border-gray-200 p-2 ${
                      isCurrentTimeUnit(column, today, timeUnit)
                        ? "bg-blue-50"
                        : ""
                    }`}
                    style={{ width: `${columnWidth}px` }}
                  >
                    {timeUnit === "Weeks" ? (
                      <div>
                        <div className="font-medium text-gray-700">
                          {formatColumnDate(column)}
                        </div>
                        <DayTilesRow
                          startDate={getStartOfWeek(column)}
                          endDate={getEndOfWeek(column)}
                        />
                      </div>
                    ) : (
                      <div className="font-medium text-gray-700">
                        {formatColumnDate(column)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex">
            {/* Fixed sprint names sidebar */}
            <div className="flex-shrink-0 w-96 border-r border-gray-200 sticky left-0 bg-white z-20 h-[500px]">
              {sprints.map((sprint) => (
                <div key={sprint.id}>
                  {sprint.epics?.map((epic) => (
                    <div
                      key={epic.id}
                      className="p-4 border-b border-gray-200 h-12 flex items-center"
                    >
                      <div className="font-medium">{epic.name}</div>
                    </div>
                  ))}
                </div>
              ))}
              <div className="p-2">
                {textInputIsVisible ? (
                  <EpicNameTextInput
                    icon={<Plus className="text-purple-600" />}
                    placeholder="What needs to be done?"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onEnter={handleEnterPress}
                  />
                ) : (
                  <button
                    className="py-1 rounded text-gray-700 hover:bg-gray-50"
                    onClick={() => setTextInputIsVisible(!textInputIsVisible)}
                  >
                    + Add epic
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable timeline grid */}
            <div className="flex-grow relative" ref={containerRef}>
              {/* Grid background */}
              <div className="absolute inset-0">
                <div className="flex h-full">
                  {timeColumns.map((_, index) => (
                    <div
                      key={index}
                      className="border-r border-gray-200 h-full min-w-[200px]"
                      style={{ width: `${getColumnWidth()}px` }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Today indicator */}

              {calculateTodayPosition() && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-blue-500 z-10"
                  style={{ left: calculateTodayPosition() }}
                >
                  <div className="absolute top-0 left-0 transform -translate-x-1/2 bg-blue-500 text-white text-xs rounded px-1 py-0.5"></div>
                </div>
              )}

              {/* Epic rows */}
              {sprints[0].epics?.map((epic) => (
                <div
                  key={epic.id}
                  data-sprint-id={epic.id}
                  className={`relative border-b border-gray-200 h-12 sprint-row ${
                    currentHoverSprint === epic.id && draggingEpic
                      ? "bg-blue-50"
                      : ""
                  }`}
                  onMouseMove={(e) => {
                    if (!epic.isPlaced) {
                      handlePlacingEpicMouseMove(e, epic.id);
                    }
                  }}
                  onClick={(e) => handleClickOnEpicRow(e, epic.id)}
                >
                  {/* Render single epic directly */}
                  {epic.startDate &&
                    epic.endDate &&
                    (() => {
                      const style = calculateItemStyle(
                        epic.startDate,
                        epic.endDate
                      );
                      const isDragging = draggingEpic === epic.id;
                      const isResizing = resizingEpic?.id === epic.id;

                      return (
                        <div
                          key={epic.id}
                          className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded text-white px-3 flex items-center overflow-hidden 
                                    ${
                                      isDragging || isResizing
                                        ? "opacity-70 shadow-lg z-10 cursor-move"
                                        : "cursor-pointer hover:brightness-90"
                                    }`}
                          style={{
                            ...style,
                            backgroundColor: epic.color || "#3b82f6",
                          }}
                          onMouseDown={(e) =>
                            handleEpicMouseDown(e, epic.id, "center")
                          }
                        >
                          {/* Left resize handle */}
                          <div
                            className="absolute left-0 top-0 w-2 h-full cursor-ew-resize"
                            onMouseDown={(e) =>
                              handleEpicMouseDown(e, epic.id, "left")
                            }
                          ></div>

                          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                            {/* {epic.name} */}
                          </span>

                          {/* Right resize handle */}
                          <div
                            className="absolute right-0 top-0 w-2 h-full cursor-ew-resize"
                            onMouseDown={(e) =>
                              handleEpicMouseDown(e, epic.id, "right")
                            }
                          ></div>

                          {/* Delete button */}
                          {onDeleteEpic && (
                            <button
                              className="absolute right-1 top-1 w-4 h-4 flex items-center justify-center rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEpic(epic.id);
                              }}
                            >
                              <span className="text-xs">×</span>
                            </button>
                          )}
                        </div>
                      );
                    })()}

                  {/* Epics in this sprint */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TimelineControls
        timeUnit={timeUnit}
        setTimeUnit={setTimeUnit}
        scrollToToday={scrollToToday}
      />
    </div>
  );
};

export default ScrollableTimeline;
