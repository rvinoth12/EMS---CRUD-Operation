const express = require("express");
const app = express();
const cors = require("cors");
const connection = require('./database');
app.use(cors());
app.use(express.json());
app.use(express.static('Public'));



// get enployee list
app.get('/getEmployee', async (req, res) => {
    try {
        const sql = "SELECT * FROM employee";
        connection.query(sql, (err, result) => {
            if (err) return res.json({ Error: "Get employee error in sql" });
            return res.json({ status: "success", result: result })
        })
    } catch (error) {
        console.error(error)
    }
})

// create employee
app.post('/createEmployee', (req, res) => {
    try {
        const { emp_id, first_name, last_name, email_id, phone_no, hire_date, designation, salary } = req.body
        // console.log("id",req.body);

        connection.query("INSERT INTO employee VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [emp_id, first_name, last_name, email_id, phone_no, hire_date, designation, salary],
            (err, result) => {
                if (result) {
                    res.json({ status: "success", result: result });
                } else {
                    res.json({ status: "error" })
                }
            }
        )
    } catch (error) {
        console.error(error)
    }
})

// update employee
app.put("/updateEmployee", (req, res) => {
    try {
        const { emp_id, first_name, last_name, email_id, phone_no, hire_date, designation, salary } = req.body
        const UpdateQuary = "UPDATE employee SET `first_name`= ?, `last_name`= ?, `email_id`= ?,`phone_no`= ?, `hire_date`= ?, `designation`= ?, `salary`= ? WHERE emp_id = ?"
        const values = [
         first_name, last_name, email_id, phone_no, hire_date, designation, salary,emp_id,
        ]
        // console.log("values",values);

        connection.query(UpdateQuary, values, (err, data) => {
            if (err) return res.json({ status: "error" });
            // return res.json(data);
            return res.json({ status: "success" })
        });
    } catch (error) {
        console.error(error)

    }
});

// delete employee
app.delete('/deleteEmployee/:id', (req, res) => {
    try {
        const id = req.params.id;
        const sql = "Delete FROM employee WHERE emp_id = ?";
        connection.query(sql, [id], (err, result) => {
            if (err) return res.json({ status: "error" });
            return res.json({ status: "success" })
        })
    } catch (error) {
        console.error(error)
    }
})

app.listen(8080, function(){
    console.log('App Listening on port 8080');
    connection.connect(function(err){
        if(err) throw err;
        console.log('Database connected!');
    })
});