import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths } from 'date-fns';

import { Calendar as  ChevronLeft, ChevronRight} from 'lucide-react';
import { Label } from './ui/Label';
import { Input } from './ui/input';
import { Button } from './ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    startTime: '',
    endTime: '',
    description: '',
    color: '#4f46e5' 
  });

  // Load events from localStorage on mount
  useEffect(() => {
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  // Get days for current month view
  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  // Check for event time conflicts
  const hasTimeConflict = (newStart, newEnd, existingEvents, excludeEventId = null) => {
    return existingEvents.some(event => {
      if (excludeEventId && event.id === excludeEventId) return false;
      const eventStart = new Date(`${event.date}T${event.startTime}`);
      const eventEnd = new Date(`${event.date}T${event.endTime}`);
      const checkStart = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${newStart}`);
      const checkEnd = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${newEnd}`);
      
      return (checkStart < eventEnd && checkEnd > eventStart);
    });
  };

  // Handle event creation/editing
  const handleEventSubmit = (e) => {
    e.preventDefault();
    
    if (hasTimeConflict(newEvent.startTime, newEvent.endTime, events, selectedEvent?.id)) {
      alert('There is a time conflict with an existing event!');
      return;
    }

    if (selectedEvent) {
      // Edit existing event
      setEvents(events.map(event =>
        event.id === selectedEvent.id
          ? { ...newEvent, id: selectedEvent.id, date: format(selectedDate, 'yyyy-MM-dd') }
          : event
      ));
    } else {
      // Create new event
      setEvents([
        ...events,
        {
          ...newEvent,
          id: Date.now(),
          date: format(selectedDate, 'yyyy-MM-dd')
        }
      ]);
    }

    setShowEventModal(false);
    setNewEvent({ title: '', startTime: '', endTime: '', description: '', color: '#4f46e5' });
    setSelectedEvent(null);
  };

  // Filter events based on search term
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export events as JSON
  const exportEvents = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `calendar-events-${format(currentDate, 'yyyy-MM')}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-2xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <Button
            variant="outline"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
          />
          <Button onClick={exportEvents}>Export Events</Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold">
            {day}
          </div>
        ))}
        
        {getDaysInMonth().map(date => {
          const dayEvents = filteredEvents.filter(event =>
            event.date === format(date, 'yyyy-MM-dd')
          );
          
          return (
            <div
              key={date.toString()}
              className={`
                p-2 min-h-24 border cursor-pointer
                ${isToday(date) ? 'bg-blue-50' : ''}
                ${!isSameMonth(date, currentDate) ? 'text-gray-400' : ''}
                ${isSameDay(date, selectedDate) ? 'border-blue-500' : ''}
              `}
              onClick={() => {
                setSelectedDate(date);
                setShowEventModal(true);
                setSelectedEvent(null);
                setNewEvent({ title: '', startTime: '', endTime: '', description: '', color: '#4f46e5' });
              }}
            >
              <div className="font-medium">{format(date, 'd')}</div>
              {dayEvents.map(event => (
                <div
                  key={event.id}
                  className="text-sm p-1 mt-1 rounded"
                  style={{ backgroundColor: event.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                    setNewEvent(event);
                    setShowEventModal(true);
                  }}
                >
                  {event.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Edit Event' : 'Add Event'} - {format(selectedDate, 'MMM dd, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEventSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="color">Event Color</Label>
              <Input
                id="color"
                type="color"
                value={newEvent.color}
                onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
              />
            </div>

            <div className="flex justify-between">
              <Button type="submit">
                {selectedEvent ? 'Update Event' : 'Add Event'}
              </Button>
              
              {selectedEvent && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    setEvents(events.filter(e => e.id !== selectedEvent.id));
                    setShowEventModal(false);
                  }}
                >
                  Delete Event
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;