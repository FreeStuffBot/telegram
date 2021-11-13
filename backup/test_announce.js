const announcements = require('./lib/announcements');
announcements.handleFreeStuffAPIEvent({
    event: 'webhook_test',
    data: 'Did you know that 1 + 1 = 3?'
})