// Function to get the current time in IST
function getCurrentIST() {
    const now = new Date();
    const offset = 330 * 60 * 1000; // IST is UTC+5:30
    return new Date(now.getTime() + offset);
}

// Timer Configuration with actual end times in IST
const timers = {
    'leetcode-biweekly': { end: new Date('2024-09-14T20:00:00+05:30').getTime() }, // Biweekly Contest 139: September 14, 2024, 8:00 PM IST
    'leetcode-weekly': { end: new Date('2024-09-08T08:00:00+05:30').getTime() }, // Weekly Contest 414: September 8, 2024, 8:00 AM IST
    'codechef-long': { end: new Date('2024-09-06T15:00:00+05:30').getTime() }, // September Long Challenge: September 6, 2024, 3:00 PM IST
    'codechef-cookoff': { end: new Date('2024-09-15T21:30:00+05:30').getTime() }, // September Cook-Off: September 15, 2024, 9:30 PM IST
    'codeforces-round': { end: new Date('2024-09-03T19:05:00+05:30').getTime() }, // Codeforces Round 895: September 3, 2024, 7:05 PM IST
    'gfg-weekly': { end: new Date('2024-09-01T19:30:00+05:30').getTime() } // GFG Weekly Contest 167: September 1, 2024, 7:30 PM IST
};

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
            timers[timerId].end = new Date().getTime() + 3600000; // Reset to 1 hour from now or any other interval
            return; // Optional: Reset timer for next event
        }

        const { days, hours, minutes, seconds } = formatTime(timeLeft);
        timerElement.innerHTML = `<span class="day">${days}</span>:<span>${hours}</span>:<span>${minutes}</span>:<span>${seconds}</span>`;
    }

    update(); // Initial update
    setInterval(update, 1000); // Update every second
}

// Initialize timers
for (const timerId in timers) {
    updateTimer(timerId);
}
