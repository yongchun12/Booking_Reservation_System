const Booking = require('./models/Booking');
const pool = require('./config/database');

async function checkApiLogic() {
    try {
        const userId = 5; // desmondlwc123
        console.log(`Checking API logic for User ID: ${userId}`);

        // 1. Own Bookings
        const ownBookings = await Booking.findByUserId(userId);
        console.log(`Own Bookings: ${ownBookings.length}`);

        // 2. Invited Bookings
        const [invitedBookings] = await pool.execute(
            `SELECT b.*, r.name as resource_name, r.type as resource_type, ba.status as my_rsvp_status
             FROM bookings b 
             JOIN resources r ON b.resource_id = r.id 
             JOIN booking_attendees ba ON b.id = ba.booking_id
             WHERE ba.user_id = ? 
             ORDER BY b.booking_date DESC, b.start_time DESC`,
            [userId]
        );
        console.log(`Invited Bookings: ${invitedBookings.length}`);

        // Combine logic (simplified map)
        const allBookingsMap = new Map();
        ownBookings.forEach(b => allBookingsMap.set(b.id, { ...b, is_owner: true }));
        invitedBookings.forEach(b => {
            if (!allBookingsMap.has(b.id)) {
                allBookingsMap.set(b.id, { ...b, is_owner: false });
            }
        });

        const finalResult = Array.from(allBookingsMap.values());
        console.log(`Total Combined: ${finalResult.length}`);
        console.log("--- Final Bookings List ---");
        console.log(JSON.stringify(finalResult, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkApiLogic();
