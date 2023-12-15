import React, { memo, useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Alert, Button, Divider, Grid, IconButton, InputBase, Pagination, Stack, Typography, alpha } from '@mui/material';
import { LiaEdit } from "react-icons/lia";
import { MdDeleteOutline } from "react-icons/md";
import { FcCancel } from "react-icons/fc";
import { VscArrowSmallDown, VscArrowSmallUp } from "react-icons/vsc";
import { RiSave3Fill } from "react-icons/ri";
import { IoIosSearch, IoMdAdd } from "react-icons/io";
import axios from 'axios';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
// import Papa from 'papaparse';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const Employee = () => {
    const columns = [
        {
            id: 'emp_id',
            label: 'Employee Id',
            minWidth: 100,
            align: 'left'
        },
        {
            id: 'first_name',
            label: 'First Name',
            minWidth: 100,
            align: 'left'
        },
        {
            id: 'last_name',
            label: 'Last Name',
            minWidth: 100,
            align: 'left',
        },
        {
            id: 'email_id',
            label: 'Email Id',
            minWidth: 100,
            align: 'left',

        },
        {
            id: 'phone_no',
            label: 'Phone No',
            minWidth: 100,
            align: 'left',
        },
        {
            id: 'hire_date',
            label: 'Hire Date',
            minWidth: 100,
            align: 'left',
        },
        {
            id: 'designation',
            label: 'Designation',
            minWidth: 100,
            align: 'left',
        },
        {
            id: 'salary',
            label: 'Salary',
            minWidth: 100,
            align: 'left',
            format: (value) => value.toLocaleString('en-US'),
        },
    ];

    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [showEdit, setShowEdit] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [open, setOpen] = useState(false);
    const count = 5;


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // sort table head function
    const [sortOrder, setSortOrder] = useState({ type: "name", sort: "'asc'" }); // Initialize sort order state
    const sortData = (column) => {
        setShowEdit(null);
        const sortedData = rows?.filter(data => Boolean(data?.emp_id))?.sort((a, b) => {
            if (sortOrder?.sort === 'asc') {
                if (a[column] < b[column]) {
                    return -1;
                }
                if (a[column] > b[column]) {
                    return 1;
                }
                return 0;
            } else {
                if (a[column] > b[column]) {
                    return -1;
                }
                if (a[column] < b[column]) {
                    return 1;
                }
                return 0;
            }
        });
        setRows(sortedData);
        setSortOrder({ ...sortOrder, type: column, sort: sortOrder?.sort === 'asc' ? 'desc' : 'asc' }); // Toggle sort order after sorting
    };

    // alert box JSX
    const alertBox = (status, text) => {
        setErrorMsg(
            <Stack sx={{ width: '25%', minWidth: "250px", position: "absolute", top: 10, right: 10 }} spacing={2}>
                <Alert severity={status} onClose={() => { setErrorMsg(null) }}>
                    {(Boolean(text) ? text : "")}</Alert>
            </Stack>
        )
        const alertBox = setTimeout(() => {
            setErrorMsg(null)
        }, 2000);
    }

    // add employe Row
    const handleAddEmployeRow = () => {
        const { emp_id, first_name, last_name, email_id,
            phone_no, hire_date, designation, salary } = rows[rows?.length - 1] || []

        let empty = [emp_id, first_name, last_name, email_id,
            phone_no, hire_date, designation, salary]?.every(Boolean)

        if (empty || rows?.length === 0) {
            let addNewRow = {
                emp_id: "",
                first_name: "",
                last_name: "",
                email_id: "",
                phone_no: "",
                hire_date: "",
                designation: "",
                salary: "",
            }
            setRows([...rows, addNewRow])
            setShowEdit(rows?.length)
        }

    }

    // input datas handle
    const handleOnChangeInput = (e, index) => {
        let changeInput = [...rows]
        let { name, value } = e.target
        changeInput[index][name] = name === "salary" ? Number(value) : value
        setRows(changeInput)
        // console.log("changeinput",changeInput);
    }

    // get employee list
    const getEmployeeList = async (search) => {
        try {
            const response = await axios.get('http://localhost:8080/getEmployee');
            // console.log("response", response?.data)
            if (response?.data.status === "success") {
                let filteredEmployees = response?.data?.result;

                if (Boolean(search)) {
                    filteredEmployees = response?.data?.result?.filter((employee) =>
                        Object.values(employee).some((value) => {
                            if (typeof value === 'string' || typeof value === 'number') {
                                const strValue = String(value).toLowerCase();
                                return strValue.includes(search || "");
                            }
                            return false;
                        })
                    );
                }

                setOpen(false)
                setRows(filteredEmployees)
            }
            else {
                alertBox(response?.data.status)
            }
        } catch (error) {
            console.error("employee get error", error);
        }
    }

    // insert new Employee
    const addEmployee = async (index) => {
        // alert()
        let error = true
        columns?.map(col => {
            if (col.id !== "emp_id" && !Boolean(rows[index][col.id])) {
                error = false
            }
        })
        if (error) {
            try {
                let payload = { ...rows[index] }
                payload.emp_id = (rows[rows?.length -2].emp_id + 1)
                const response = await axios.post('http://localhost:8080/createEmployee', payload);
                if (response?.data?.status === "success") {
                    alertBox("success", "inserted New Employee ")
                    setShowEdit(null)
                    getEmployeeList()
                }
                else {
                    alertBox("error", response?.data?.status)
                }

            } catch (error) {
                console.error("employee Insert error", error)
            }
        }
        else {
            alertBox("error", "Some fields are invalid")

        }
    }

    // update Employee
    const UpdateEmployee = async (index) => {
        // alert()
        let error = true
        columns?.map(col => {
            if (col.id !== "emp_id" && !Boolean(rows[index][col.id])) {
                error = false
            }
        })
        if (error) {
            try {
                let payload = rows[index]
                payload.hire_date = new Date(payload?.hire_date)?.toISOString()?.split("T")[0]

                console.log("payload", payload);
                const response = await axios.put(`http://localhost:8080/updateEmployee`, payload);
                if (response?.data?.status === "success") {
                    alertBox("success", "Updated " + payload?.emp_id + " Employee Details ")
                    setShowEdit(null)
                    getEmployeeList()
                }
                else {
                    alertBox("error", response?.data?.status)
                }

            } catch (error) {
                console.error("employee Insert error", error)
            }
        }
        else {
            alertBox("error", "Some fields are invalid")
        }
    }


    // delete employee data
    const deleteEmployee = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:8080/deleteEmployee/${id}`,);
            if (response?.data?.status === "success") {
                alertBox("success", "Delete Employee " + id)
                getEmployeeList()
            }
            else {
                alertBox("error", response?.data?.status)
            }

        } catch (error) {
            console.error("employee Insert error", error)
        }
    }

    // search filter
    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        getEmployeeList(searchTerm)
    };


    // database data to csv file coversion
    const downloadCSV = () => {
        const separator = ','; // Change this to ';' if your system uses a different separator
        const keys = Object.keys(rows[0]);
        const csvContent =
            keys.join(separator) +
            '\n' +
            rows.map((row) => keys.map((key) => row[key]).join(separator)).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'Employee_List.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };



    useEffect(() => {
        getEmployeeList("");
        setShowEdit(null)
    }, [])




    return (
        <>
            {errorMsg}
            <Divider sx={{ my: 3, fontSize: { xs: "14px", md: "100%" } }}>
                Employee Management System - EMS (CRUD Operation)
            </Divider>
            <Paper sx={{ boxShadow: 0, mb: 1, borderRadius: "0px !important" }}>
                <Grid container spacing={1} alignItems={'center'}>
                    <Grid item xs={12} sm={4} md={4} lg={4} sx={{ display: 'flex', alignItems: 'center', flexWrap: "wrap", gap: 2 }}>
                        <Typography sx={{ fontSize: { xs: "12px", md: "14px" } }}>All Employee List</Typography>
                        <Button disabled={rows?.length === 0} onClick={downloadCSV} variant='outlined' sx={{ fontSize: "12px" }} >download csv</Button>

                    </Grid>
                    <Grid item sm={8} sx={{ display: 'flex', justifyContent: { xs: "left", sm: "right" } }} xs={12} md={8} lg={8}>
                        <div style={{ display: "flex", alignItems: 'center', gap: 10, flexWrap: 'nowrap' }}>
                            <Paper className='col-4'
                                component="form"
                                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', minWidth: 200 }}
                            >
                                <InputBase className='col-12'
                                    onChange={handleSearch}
                                    sx={{ ml: 1, fontSize: "12px", flex: 1 }}
                                    placeholder="Search Employee ..."
                                />
                                <IconButton type="button" sx={{ p: '4px' }} aria-label="search">
                                    <IoIosSearch />
                                </IconButton>
                            </Paper>

                            <Button onClick={handleAddEmployeRow} variant="outlined" startIcon={<IoMdAdd />} color="success">
                                ADD
                            </Button>
                        </div>
                    </Grid>
                </Grid>

            </Paper>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ minHeight: 440, }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead >
                            <TableRow>
                                {columns.map((column, index) => (
                                    <TableCell onClick={() => { sortData(column.id); }} sx={{ px: 1, py: 0, bgcolor: "#f1f1f1", cursor: 'pointer' }}
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth, }}
                                    >
                                        {column.label} {sortOrder?.type === column?.id && (sortOrder.sort !== "asc" ? <VscArrowSmallUp /> : <VscArrowSmallDown />)}
                                    </TableCell>
                                ))}
                                <TableCell sx={{ minWidth: 100, p: 1.5, bgcolor: "#f1f1f1" }} align='center'>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows
                                ?.slice(page == 1 ? page * 0 : (page - 1) * count, page == 1 ? page * 0 + count : (page - 1) * count + count)
                                ?.map((row, index) => {
                                    // console.log("sus", showEdit)
                                    return (
                                        <TableRow sx={{ bgcolor: index % 2 === 1 && alpha("#f9f9f9", 0.7) }} hover role="checkbox" tabIndex={-1} key={row.code}>
                                            {columns.map((column) => {
                                                const value = row[column.id];
                                                // alert(Boolean(showEdit))
                                                return (
                                                    <TableCell sx={{ p: 1, }} key={column.id} align={column.align}>
                                                        {Boolean(showEdit !== index || (Boolean(row?.emp_id && column.id === 'emp_id'))) ?
                                                            <Typography sx={{ fontSize: "12px" }}>
                                                                {column.format && typeof value === 'number'
                                                                    ? column.format(value)
                                                                    : column.id === 'hire_date' ? Boolean(value) && new Date(value)?.toISOString()?.split('T')[0] : value}
                                                            </Typography>
                                                            :

                                                            <>
                                                                {column.id !== 'emp_id' &&
                                                                    <InputBase
                                                                        value={column.id === 'hire_date' ? Boolean(value) && new Date(value)?.toISOString()?.split('T')[0] : value}
                                                                        name={column.id}
                                                                        type={column.id === "hire_date" ? "date" : column.id === "salary" ? "number" : "text"}
                                                                        onChange={(e) => handleOnChangeInput(e, index)}
                                                                        sx={{ width: "100% !important", border: "1px solid", borderColor: Boolean(row[column.id]) ? "lightgray" : "red", px: 0.5, fontSize: "12px" }}
                                                                        placeholder={column.label}

                                                                    />
                                                                }
                                                            </>

                                                        }
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell sx={{ p: 1 }} align='center'>
                                                {showEdit !== index ?
                                                    <div>
                                                        <IconButton disabled={Boolean(showEdit)} onClick={() => setShowEdit(index)}>
                                                            <LiaEdit style={{ color: Boolean(showEdit) ? "slategray" : "green", fontSize: 16 }} />
                                                        </IconButton>
                                                        <IconButton onClick={() => setOpen(row?.emp_id)} disabled={Boolean(showEdit)} >
                                                            <MdDeleteOutline style={{ color: Boolean(showEdit) ? "slategray" : "red", fontSize: 16 }} />
                                                        </IconButton>
                                                    </div>
                                                    :
                                                    <div>
                                                        <IconButton onClick={() => { Boolean(row?.emp_id) ? UpdateEmployee(index) : addEmployee(index) }}>
                                                            <RiSave3Fill style={{ color: "darkgreen", fontSize: 16 }} />
                                                        </IconButton>
                                                        <IconButton onClick={() => { setShowEdit(null); setRows(rows.filter(data => Boolean(data?.emp_id))); getEmployeeList() }}>
                                                            <FcCancel style={{ fontSize: 16 }} />
                                                        </IconButton>
                                                    </div>}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
            
                <div style={{ display: 'flex', justifyContent: 'right', alignItems: 'center', marginTop: "0.5rem", marginBottom: "0.5rem" }}>
                    <Pagination
                        color="success"
                        count={Math?.ceil(rows.length / count)}
                        page={page}
                        onChange={(e, newValue) => handleChangePage(e, newValue)}
                        variant="outlined"
                        shape="rounded"
                        showFirstButton
                        showLastButton
                    />
                </div>
            </Paper>

            {/* delete confirm diloag box  */}
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                maxWidth="xs"
                fullWidth
                onClose={() => setOpen(false)}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle sx={{ fontSize: "15px" }}>{"Warning : "}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontSize: "12px" }} id="alert-dialog-slide-description">

                        Deleting this employee's information will remove it permanently. Are you certain you want to proceed?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button sx={{ fontSize: "12px", width: "90px", textAlign: "center", }} variant='outlined' color='secondary' onClick={() => setOpen(false)}>No</Button>
                    <Button sx={{ fontSize: "12px", width: "90px", textAlign: "center", }} variant='outlined' onClick={() => deleteEmployee(open)}>Proceed</Button>
                </DialogActions>
            </Dialog>

        </>
    );
}

export default memo(Employee)