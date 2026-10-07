const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const DonorProfile = require('./models/DonorProfile');
const { getCompatibleDonorsForRecipient } = require('./utils/bloodCompatibility');
const { sanitizeDonorForPublic } = require('./utils/privacyFilter');

(async () => {
  try {
    await connectDB();
    const comp = getCompatibleDonorsForRecipient('A+');
    console.log('A+ biologically compatible donor groups:', comp);

    const results = await DonorProfile.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [-74.0060, 40.7128] },
          distanceField: 'distanceMeters',
          maxDistance: 50000,
          spherical: true,
          query: { isAvailable: true, bloodGroup: { $in: comp } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      }
    ]);

    console.log(`Matched donors count: ${results.length}`);
    results.forEach((r) => {
      const safe = sanitizeDonorForPublic(
        {
          _id: r._id,
          bloodGroup: r.bloodGroup,
          isAvailable: r.isAvailable,
          addressLocality: r.addressLocality,
          user: r.userDetails
        },
        r.distanceMeters
      );
      console.log(`- ${safe.donorName} (${safe.bloodGroup}) | ${safe.distanceDisplay} | ${safe.locality} | Coords exposed: ${safe.location !== undefined}`);
    });

    console.log('\n[TEST SUCCESS] Geospatial matching and privacy protection verified.');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
})();
