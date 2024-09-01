// Timer Configuration with updated end times in IST
const timers = {
    'leetcode-weekly': { 
        // Weekly Contest: Every Sunday at 8:00 AM IST
        end: getNextSunday8AM().getTime() 
    },
    'leetcode-biweekly': { 
        // Biweekly Contest: Every Saturday at 8:00 PM IST
        end: getNextSaturday8PM().getTime() 
    },
    'codechef-long': { 
        end: new Date('2024-09-06T15:00:00+05:30').getTime() 
    },
    'codechef-starters': { 
        end: new Date('2024-09-07T15:00:00+05:30').getTime() // Example end time for Starters
    },
    'codechef-cookoff': { 
        end: new Date('2024-09-15T21:30:00+05:30').getTime() 
    },
    'codeforces-round': { 
        end: new Date('2024-09-03T19:05:00+05:30').getTime() 
    },
    'gfg-weekly': { 
        end: new Date('2024-09-01T19:30:00+05:30').getTime() 
    }
};

// Function to get the next Sunday at 8:00 AM IST
function getNextSunday8AM() {
    const now = getCurrentIST();
    const nextSunday = new Date(now);
  
    // Calculate the difference in days between the current day and the next Sunday
    const daysToNextSunday = (7 - now.getDay() + 7) % 7;
  
    nextSunday.setDate(now.getDate() + daysToNextSunday);
    nextSunday.setHours(8, 0, 0, 0); // Set to 8:00 AM
    return nextSunday;
}

// Function to get the next Saturday at 8:00 PM IST
function getNextSaturday8PM() {
    const now = getCurrentIST();
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7));
    nextSaturday.setHours(20, 0, 0, 0); // Set to 8:00 PM
    return nextSaturday;
}

// Function to get the current time in IST
function getCurrentIST() {
    const now = new Date();
    const offset = 330 * 60 * 1000; // IST is UTC+5:30
    return new Date(now.getTime() + offset);
}

// Function to update a single timer
function updateTimer(timerId) {
    const timerElement = document.getElementById(timerId);
    const endTime = timers[timerId].end;

    function formatTime(ms) {
        const days = Math.floor(ms / (24 * 60 * 60 * 1000));
        const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((ms % (60 * 1000)) / 1000);

        return {
            days: String(days).padStart(2, '0'),
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0')
        };
    }

    function update() {
        const now = getCurrentIST().getTime();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
            timerElement.innerHTML = '<span class="day">00</span>:<span>00</span>:<span>00</span>:<span>00</span>';
            timers[timerId].end = getNextContestEndTime(timerId).getTime(); // Reset to next contest time
            return; // Optional: Reset timer for next event
        }

        const { days, hours, minutes, seconds } = formatTime(timeLeft);
        timerElement.innerHTML = `<span class="day">${days}</span>:<span>${hours}</span>:<span>${minutes}</span>:<span>${seconds}</span>`;
    }

    update(); // Initial update
    setInterval(update, 1000); // Update every second
}

// Function to get the next contest end time based on the contest type
function getNextContestEndTime(timerId) {
    if (timerId === 'leetcode-weekly') {
        return getNextSunday8AM();
    } else if (timerId === 'leetcode-biweekly') {
        return getNextSaturday8PM();
    } else {
        return new Date(); // Default to now for other contests
    }
}

// Initialize timers
for (const timerId in timers) {
    updateTimer(timerId);
}
