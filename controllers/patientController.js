const Patient = require('../models/Patient');

// POST /api/patients/register
exports.registerPatient = async (req, res) => {
  try {
    // 1. Validate role (Mocking the Auth Middleware for now)
    // In production, req.user.role would come from the JWT token
    // if (req.user.role !== 'Clerk') return res.status(403).send("Access Denied");

    // 2. Extract data from request body
    const { 
      firstName, lastName, dob, gender, contactNumber, 
      entryPoint, knownDiseases, initialComplaints, registeredBy 
    } = req.body;

    // 3. Generate a simple Patient ID (You can make this more complex later)
    const patientID = 'PAT-' + Date.now(); 

    // 4. Create the record
    const newPatient = new Patient({
      patientID,
      firstName,
      lastName,
      dob,
      gender,
      contactNumber,
      entryPoint,
      knownDiseases,
      initialComplaints,
      registeredBy 
    });

    // 5. Save to MongoDB
    await newPatient.save();

    // 6. Return JSON response [cite: 90]
    res.status(201).json({ 
      message: "Patient Registered Successfully", 
      patient: newPatient 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};