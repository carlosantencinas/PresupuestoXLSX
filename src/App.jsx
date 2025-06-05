import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Pagination from "@mui/material/Pagination";
import Button from "@mui/material/Button";
import html2pdf from "html2pdf.js";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#f50057", // rosa brillante
      light: "#ff4081",
      dark: "#c51162",
    },
    secondary: {
      main: "#f50057", // rosa brillante
      light: "#ff4081",
      dark: "#c51162",
    },
    background: {
      default: "#f5f5f5", // gris muy claro para fondo general
      paper: "#ffffff", // blanco para tarjetas
    },
    text: {
      primary: "#222222", // negro suave para texto principal
      secondary: "#555555", // gris medio para texto secundario
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#e0e0e0", // borde claro para tablas
        },
      },
    },
  },
});

function TituloConIcono({ icono, texto, colorFondoIcono = "#1976d2", colorTexto = "#1976d2" }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
      <Box
        sx={{
          backgroundColor: colorFondoIcono,
          color: "#fff",
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 24,
          mr: 2,
          boxShadow: 3,
        }}
      >
        {icono}
      </Box>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: colorTexto }}>
        {texto}
      </Typography>
    </Box>
  );
}

function DataTable({
  headers,
  rows,
  rowsPerPage = 5,
  onRowClick,
  selectedRow,
  tableTitle,
}) {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  // Filtrar filas según filtros
  const filteredRows = rows.filter((row) =>
    headers.every((_, idx) => {
      if (!filters[idx]) return true;
      const cellValue = row[idx] ? row[idx].toString().toLowerCase() : "";
      return cellValue.includes(filters[idx].toLowerCase());
    })
  );

  // Ordenar filas
  const sortedRows = [...filteredRows];
  if (sortColumn !== null) {
    sortedRows.sort((a, b) => {
      const aValue = a[sortColumn] || "";
      const bValue = b[sortColumn] || "";

      if (!isNaN(aValue) && !isNaN(bValue)) {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();
      return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }

  // Paginación
  const paginatedRows = sortedRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleFilterChange = (idx, value) => {
    setFilters((prev) => ({
      ...prev,
      [idx]: value,
    }));
    setPage(1);
  };

  const handleSort = (idx) => {
    if (sortColumn === idx) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(idx);
      setSortDirection("asc");
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {tableTitle && (
        <Typography variant="h5" sx={{ mb: 2, color: "primary.main" }}>
          {tableTitle}
        </Typography>
      )}
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {headers.map((h, i) => (
                <TableCell
                  key={i}
                  sx={{
                    fontWeight: "bold",
                    color: "primary.main",
                    fontSize: 14,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => handleSort(i)}
                >
                  {h}
                  {sortColumn === i ? (sortDirection === "asc" ? " ↑" : " ↓") : ""}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              {headers.map((_, i) => (
                <TableCell key={i}>
                  <TextField
                    size="small"
                    variant="outlined"
                    placeholder="Filtrar"
                    value={filters[i] || ""}
                    onChange={(e) => handleFilterChange(i, e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "primary.main" },
                        "&:hover fieldset": { borderColor: "primary.light" },
                      },
                    }}
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={headers.length} align="center">
                  No hay resultados
                </TableCell>
              </TableRow>
            )}
            {paginatedRows.map((row, i) => (
              <TableRow
                key={i}
                onClick={() => onRowClick && onRowClick(row[0])}
                selected={row[0] === selectedRow}
                sx={{
                  cursor: onRowClick ? "pointer" : "default",
                  "&.MuiTableRow-root.Mui-selected": {
                    backgroundColor: "primary.light",
                  },
                  "&:hover": {
                    backgroundColor: onRowClick ? "action.hover" : "inherit",
                  },
                }}
              >
                {row.map((cell, j) => (
                  <TableCell key={j} sx={{ fontSize: 14 }}>
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Pagination
          count={Math.ceil(filteredRows.length / rowsPerPage)}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          size="small"
        />
      </Box>
    </Box>
  );
}

function App() {
  const [sheets, setSheets] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const rowsPerPage = 5;  // número de items que se muestran en la principal

  useEffect(() => {
    fetch("/mi_presupuesto.xlsx")
      .then((res) => res.arrayBuffer())
      .then((data) => {
        const wb = XLSX.read(data, { type: "array" });
        const parsed = {};
        wb.SheetNames.forEach((name) => {
          const sheet = wb.Sheets[name];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          parsed[name] = rows;
        });
        setSheets(parsed);
      });
  }, []);

  if (!sheets["Presupuesto_General"]) return <p>Cargando...</p>;

  const presupuestoHeaders = sheets["Presupuesto_General"][0];
  const presupuestoRows = sheets["Presupuesto_General"].slice(1);

  const materialesHeaders = sheets["Asignación_Materiales"]?.[0] || [];
  const materialesRows = sheets["Asignación_Materiales"]?.slice(1) || [];

  const manoObraHeaders = sheets["Asignación_ManoObra"]?.[0] || [];
  const manoObraRows = sheets["Asignación_ManoObra"]?.slice(1) || [];

  // Filtrar materiales y mano de obra según el ítem seleccionado
  const materialesFiltrados = selectedItem
    ? materialesRows.filter((m) => m[0] === selectedItem)
    : [];
  const manoObraFiltrada = selectedItem
    ? manoObraRows.filter((m) => m[0] === selectedItem)
    : [];

  // Exportar PDF
  const exportPDF = () => {
    const element = document.getElementById("reporte");
    const options = {
      margin: 0.5,
      filename: "Presupuesto_General_Proyecto.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(options).from(element).save();
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ padding: 4, fontFamily: "Arial", bgcolor: "background.default", minHeight: "100vh" }}>
        <Box
          id="reporte"
          sx={{
            backgroundColor: "background.paper",
            padding: 3,
            borderRadius: 2,
            boxShadow: 3,
            color: "text.primary",
          }}
        >
          <TituloConIcono
            icono="📋"
            texto="Presupuesto General del Proyecto"
            colorFondoIcono="#ffd217"
            colorTexto="#60091a"
          />

<Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 3 }}>
  <input
    type="file"
    accept=".xlsx, .xls"
    onChange={(e) => handleImportExcel(e)}
    style={{ display: "none" }}
    id="import-excel"
  />
  <label htmlFor="import-excel">
    <Button variant="outlined" component="span" color="secondary">
      Importar Excel
    </Button>
  </label>
  <Button variant="contained" color="primary" onClick={exportPDF}>
    Exportar a PDF
  </Button>
</Box>



          <DataTable
            tableTitle="Items del Presupuesto"
            headers={presupuestoHeaders}
            rows={presupuestoRows}
            rowsPerPage={rowsPerPage}
            onRowClick={setSelectedItem}
            selectedRow={selectedItem}
          />

          {selectedItem && (
            <>
              <Typography variant="h6" sx={{ mt: 4, color: "primary.dark" }}>
                Materiales asignados al ítem: {selectedItem}
              </Typography>
              <DataTable
                tableTitle="Materiales"
                headers={materialesHeaders}
                rows={materialesFiltrados}
                rowsPerPage={rowsPerPage}
                onRowClick={null}
                selectedRow={null}
              />

              <Typography variant="h6" sx={{ mt: 4, color: "primary.dark" }}>
                Mano de Obra asignada al ítem: {selectedItem}
              </Typography>
              <DataTable
                tableTitle="Mano de Obra"
                headers={manoObraHeaders}
                rows={manoObraFiltrada}
                rowsPerPage={rowsPerPage}
                onRowClick={null}
                selectedRow={null}
              />
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
