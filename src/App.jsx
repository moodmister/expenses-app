import { useRef, useState } from "react";
import { db } from "./db";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box,
  CssBaseline,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Container,
  Grid,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { DataGrid, GridActionsCellItem, GridRowModes } from "@mui/x-data-grid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Loader from "./Loader";
import "./App.css";

// Material theme
// Documentation: https://mui.com/material-ui/customization/theming/
const defaultTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const expensesCollectionRef = collection(db, "expenses"); //reference to the collection

/**
 * Fetch all expenses as a global function to be called before
 * the inital render of the App component
 * @returns Array of all expense objects
 */

const getExpenses = async () => {
  const result = await getDocs(expensesCollectionRef);
  const expenses = result.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  return expenses;
};

// Call and store the results
const initialExpenses = await getExpenses();

function App() {
  // Expenses local variable
  const [expenses, setExpenses] = useState(initialExpenses);
  // Row models
  const [rowModesModel, setRowModesModel] = useState({});
  // Loader animation state variable
  const [isLoading, setIsLoading] = useState(false);

  // Input references
  const dateRef = useRef();
  const descRef = useRef();
  const amountRef = useRef();


  /**
   * This function validates input based on value and
   * also adds `missing` class which puts a red outline
   * to the invalid input
   * @param {React.MutableRefObject} inputRef input reference
   * @param {string} inputValue value of the input
   * @returns {boolean}
   */
  const validateInput = (inputRef, inputValue) => {
    inputRef.current.classList.remove("missing");
    if (inputValue === "") {
      inputRef.current.classList.add("missing");
      return false;
    }
    return true;
  };

  /**
   * Add expense to Firestore
   * via the input references
   */
  const addExpense = async () => {
    const descriptionValue = descRef.current.querySelector("input").value;
    const dateValue = dateRef.current.querySelector("input").value;
    const amountValue = amountRef.current.querySelector("input").value;

    if (!validateInput(descRef, descriptionValue)) return;
    if (!validateInput(dateRef, dateValue)) return;
    if (!validateInput(amountRef, amountValue)) return;

    setIsLoading(true);
    const newExpense = {
      date: new Date(dateValue),
      description: descriptionValue,
      amount: amountValue,
    };
    await addDoc(expensesCollectionRef, newExpense);
    const newExpenses = await getExpenses();
    setExpenses(newExpenses);
    setIsLoading(false);
  };

  /**
   * Callback to revert the row to view mode
   * on save click
   * @param {string} id id of the row
   */
  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };


  /**
   * Callback to revert the row to view mode
   * after cancellation of update
   * @param {string} id id of the row
   */
  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  /**
   * Sets the row to edit mode, which
   * re-renders the DataGrid component
   * @param {string} id id of the row
   */
  const handleEditClick = (id) => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  /**
   * callback to process row updates
   * passed to DataGrid component
   * @param {expense Object} newRow 
   */
  const processRowUpdate = async (newRow) => {
    setIsLoading(true);
    const docRef = doc(db, "expenses", newRow.id);
    await updateDoc(docRef, newRow);
    const newExpenses = await getExpenses();
    setExpenses(newExpenses);
    setIsLoading(false);
  };
  /**
   * callback to delete an expense 
   * from Firestore
   * @param {string} id 
   */
  const deleteExpense = async (id) => {
    setIsLoading(true);
    const docRef = doc(db, "expenses", id);
    await deleteDoc(docRef);
    const newExpenses = await getExpenses();
    setExpenses(newExpenses);
    setIsLoading(false);
  };

  /**
   * Callback to change the row modes models
   * @param {import("@mui/x-data-grid").GridRowModesModel} newRowModesModel row modes model
   */
  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    {
      field: "date",
      headerName: "Date",
      type: "date",
      flex: 0.2,
      editable: true,
      valueGetter: (params) => new Date(params.value.seconds * 1000),
      valueFormatter: (row) => row.value.toDateString(),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 0.5,
      editable: true,
    },
    {
      field: "amount",
      headerName: "Amount",
      type: "number",
      flex: 0.2,
      editable: true,
    },
    {
      field: "actions",
      headerName: "Actions",
      type: "actions",
      flex: 0.1,
      getActions: (row) => {
        const isInEditMode = rowModesModel[row.id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key={`${row.id}Edit`}
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(row.id)}
            />,
            <GridActionsCellItem
              key={`${row.id}Cancel`}
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(row.id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key={row.id}
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={() => {
              handleEditClick(row.id);
            }}
            color="inherit"
          />,
          <GridActionsCellItem
            key={row.id}
            icon={<DeleteIcon />}
            label="Delete"
            className="textPrimary"
            onClick={() => {
              deleteExpense(row.id);
            }}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <>
      <ThemeProvider theme={defaultTheme}>
        <Container
          sc={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CssBaseline />
          <Box component="main">
            <Typography
              component="h1"
              variant="h3"
              color="inherit"
              noWrap
              align="center"
              sx={{ flexGrow: 1 }}
            >
              Expenses app
            </Typography>
            <Grid
              container
              spacing={2}
              sx={{
                width: "100%",
                p: 2,
              }}
            >
              <Grid item sm={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker ref={dateRef} />
                </LocalizationProvider>
              </Grid>
              <Grid item sm={12} md={3}>
                <TextField
                  id="description"
                  label="Description"
                  variant="standard"
                  ref={descRef}
                />
              </Grid>
              <Grid item sm={12} md={3}>
                <TextField
                  id="Amount"
                  type="number"
                  label="Amount"
                  variant="standard"
                  ref={amountRef}
                />
              </Grid>
              <Grid
                item
                sm={12}
                md={3}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <Button
                  variant="contained"
                  sx={{ width: "100px" }}
                  onClick={addExpense}
                >
                  ADD
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setIsLoading(true);
                    getExpenses().then((res) => {
                      setExpenses(res);
                      setIsLoading(false);
                    });
                  }}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
            {/* MUI X Component https://mui.com/x/react-data-grid/ */}
            <DataGrid
              columns={columns}
              rows={expenses}
              editMode="row"
              rowModesModel={rowModesModel} // initial row modes model
              onRowModesModelChange={handleRowModesModelChange} // row modes update
              processRowUpdate={processRowUpdate} // row update callback
              /**
               * optional Error handler
               * onProcessRowUpdateError={console.error}
              */
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10]}
            ></DataGrid>
            { /** Loader with loading animation */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress
                sx={{ visibility: isLoading ? "visible" : "hidden" }}
              />
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </>
  );
}

export default App;
