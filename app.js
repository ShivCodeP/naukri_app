require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");

const connect = () => {
    return mongoose.connect(`mongodb+srv://naukri:${process.env.MONGODB_PASS}@cluster0.u9tan.mongodb.net/test`)
}

// JOB SCHEMA

const jobSchema = new mongoose.Schema(
    {
        designation: {
            type: String,
            required: true
        },
        no_seat: {
            type: Number,
            required: true
        },
        job_role: {
            type: String,
            required: false
        },
        skill_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "skill"
            }
        ],
        office_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "office"
            }
        ],
        job_rating: { type: String, required: true }

    },
    {
        versionKey: false,
        timestamps: true,
    }
);

const Job = mongoose.model("job", jobSchema);

// COMPANY SCHEMA

const companySchema = new mongoose.Schema(
    {

        company_name: { type: String, required: true },
        company_detail: { type: String, required: true },
        job_ids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "job",
            }
        ]

    },
    {
        versionKey: false,
        timestamps: true,
    }
);

const Company = mongoose.model("company", companySchema);

// SKILL SCHEMA

const skillSchema = new mongoose.Schema(
    {
        skill: { type: String, required: true },
    },
    {
        versionKey: false,
        timestamps: true,
    }
)

const Skill = mongoose.model("skill", skillSchema);

// OFFICE SCHEMA

const officeSchema = new mongoose.Schema(
    {
        office_police: { type: Number, required: true },
        office_address: { type: String, required: true },
        office_worktime: { type: String, required: true },
        workfromhome: { type: Boolean, required: true },
        
    },
    {
        versionKey: false,
        timestamps: true,
    }

);

const Office = mongoose.model("office", officeSchema);

const app = express();

// Middleware express

app.use(express.json());

// CRUD Operations

//JOB
app.post('/jobs', async (req, res) => {
    try {

        const job = await Job.create(req.body);

        return res.status(201).send(job);

    } catch (e) {
        res.status(500).json({ message: e.message, status: "Failed" });
    }
});

app.get("/jobs", async(req, res) => {
    try {
        const jobs = await Job.find().populate("skill_ids").populate("office_ids").lean().exec();

        return res.send(jobs.filter((job) => job.office_ids.filter((office) => office.workfromhome === true)));

    } catch (e) {
        res.status(500).json({ message: e.message, status: "Failed" });
    }

})

app.get("/jobs/:id", async(req, res) => {
    try {

        const job = await Job.findById(req.params.id).populate("skill_ids").populate("office_ids").lean().exec();

        return res.send(job);

    } catch (e) {
        res.status(500).json({ message: e.message, status: "Failed" });
    }
})

app.get("/jobs/:id,id/skill&location", async(req, res) => {
    try{
        let ids = req.params.id.trim().split(",");
        
        const jobs = await Job.find({$and: [{office_ids: ids[0]} ,{skill_ids: ids[1]}]}).populate("skill_ids").populate("office_ids").lean().exec();

        return res.send(jobs);
    } catch(e) {
        res.status(500).json({message: e.message, status: "Failed"});
    }
});

app.get("/jobs/officepolice", async(req, res) => {
    try {
        const jobs = await Job.find().populate("skill_ids").populate("office_ids").lean().exec();

        return res.send(jobs.filter((job) => job.office_ids.filter((office) => office.office_police >= 2)));

    } catch (e) {
        res.status(500).json({ message: e.message, status: "Failed" });
    }

})

app.get("/jobs/:id/rating", async(req, res) => {
    try {
        const jobs = await Job.find().lean().exec();

        return res.send(jobs.filter((job) => job.job_rating >= req.params.id));

    } catch (e) {
        res.status(500).json({ message: e.message, status: "Failed" });
    }

})

// COMPANY

app.get("/companys/:id", async(req, res) => {

    try {
        const company = await Company.findById(req.params.id).populate("job_ids").lean().exec();
    
        return res.send(company);
    } catch (e) {
        res.status(500).json({ message: e.message, status: "Failed" });
    }

})

app.get("/company/mostjob",async(req, res) => {
    try {
        const companys = await Company.find().lean().exec();

        const job_counts = companys.map((company) => {
            return company.job_ids.length;
        });

        const max_job = Math.max(...job_counts);

        return res.send(companys.filter((company) => company.job_ids.length === max_job));

    } catch (e) {
        res.status(500).json({ message: e.message, status: "Failed" });
    }
})

app.listen(2233, async function() {
    await connect();
    console.log("listening on port 2345");
})

