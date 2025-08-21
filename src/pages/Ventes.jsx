import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Button,
  Box,
  Skeleton,
  TablePagination,
  TextField,
  InputAdornment,
  Fade,
  Avatar,
  Chip,
  Tooltip,
  CircularProgress,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Add,
  Refresh,
  ShoppingCart,
  Receipt,
  AttachMoney,
  Person,
  LocalShipping,
  FilterList,
  Close,
  Print,
  FileDownload,
  Visibility,
  Warning,
  CheckCircle,
  TrendingUp,
  Assessment,
  DateRange,
  Euro,
  ShoppingBag,
  PersonAdd,
  Inventory,
  History,
  Analytics,
  PieChart,
  BarChart,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import Swal from "sweetalert2";
import VentesForm from "./Ventes/VenteForm";
import StockManagement from "./Stocks/StockManagement";

const API_URL = "http://localhost:5000/api/ventes";
const PIECES_API_URL = "http://localhost:5000/api/pieces";
const CLIENTS_API_URL = "http://localhost:5000/api/clients";
const AUTH_API_URL = "http://localhost:5000/api/auth/me";
const STOCK_API_URL = "http://localhost:5000/api/stock";
const ANALYTICS_API_URL = "http://localhost:5000/api/analytics";

const PremiumTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    background: "linear-gradient(90deg, rgba(245,245,245,1) 0%, rgba(255,255,255,1) 100%)",
  },
  "&:hover": {
    background: "linear-gradient(90deg, rgba(225,245,255,1) 0%, rgba(255,255,255,1) 100%)",
    transform: "scale(1.002)",
    boxShadow: theme.shadows[2],
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  color: "white",
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: theme.shadows[12],
  },
}));

// Hook personnalisé pour les analytics
const useVentesAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalVentes: 0,
    chiffreAffaires: 0,
    ventesAujourdhui: 0,
    moyenneVente: 0,
    croissanceMensuelle: 0,
    topPieces: [],
    topClients: [],
    ventesParMois: [],
    alertesStock: [],
  });

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const [ventesRes, analyticsRes] = await Promise.all([
      
        axios.get(`${ANALYTICS_API_URL}/dashboard`, { headers })
      ]);

      setAnalytics({
        totalVentes: analyticsRes.data.totalVentes,
        chiffreAffaires: analyticsRes.data.chiffreAffaires,
        ventesAujourdhui: analyticsRes.data.ventesAujourdhui,
        moyenneVente: analyticsRes.data.moyenneVente,
        croissanceMensuelle: analyticsRes.data.croissanceMensuelle,
        topPieces: analyticsRes.data.topPieces,
        topClients: analyticsRes.data.topClients,
        ventesParMois: analyticsRes.data.ventesParMois,
        alertesStock: analyticsRes.data.alertesStock
      });
    } catch (err) {
      console.error("Erreur lors du chargement des analytics:", err);
    }
  };

  return { analytics, fetchAnalytics };
};

const Ventes = () => {
  // États principaux
  const [ventes, setVentes] = useState([]);
  const [pieces, setPieces] = useState([]);
  const [clients, setClients] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [venteToEdit, setVenteToEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [userId, setUserId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [selectedVente, setSelectedVente] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [openStock, setOpenStock] = useState(false);
  const [activeTab, setActiveTab] = useState("ventes");
  const [stockData, setStockData] = useState([]);

  // États pour les filtres
  const [filterClient, setFilterClient] = useState("");
  const [filterPiece, setFilterPiece] = useState("");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Analytics
  const { analytics, fetchAnalytics } = useVentesAnalytics();

  // Fonction pour afficher les notifications
  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Vérifier l'authentification et les permissions
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(AUTH_API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserRole(response.data.role);
        setUserId(response.data.id);
      } catch (err) {
        console.error("Erreur d'authentification:", err);
      }
    };
    checkAuth();
  }, []);

  // Charger dynamiquement les ventes, pièces et clients depuis l'API
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [ventesRes, piecesRes, clientsRes, stockRes] = await Promise.all([
          axios.get(API_URL, { headers }),
          axios.get(PIECES_API_URL, { headers }),
          axios.get(CLIENTS_API_URL, { headers }),
          axios.get(STOCK_API_URL, { headers })
        ]);

        setVentes(ventesRes.data);
        setPieces(piecesRes.data);
        setClients(clientsRes.data);
        setStockData(stockRes.data);
        await fetchAnalytics();
        setLoading(false);
      } catch (err) {
        setError("Erreur de chargement des données");
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Fonction pour rafraîchir les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [ventesRes, piecesRes, clientsRes, stockRes] = await Promise.all([
        axios.get(API_URL, { headers }),
        axios.get(PIECES_API_URL, { headers }),
        axios.get(CLIENTS_API_URL, { headers }),
        axios.get(STOCK_API_URL, { headers })
      ]);

      setVentes(ventesRes.data);
      setPieces(piecesRes.data);
      setClients(clientsRes.data);
      setStockData(stockRes.data);
      await fetchAnalytics();
      showSnackbar("Données actualisées avec succès");
    } catch (err) {
      showSnackbar("Erreur lors de l'actualisation", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEdit = (vente) => {
    if (userRole !== "admin") {
      showSnackbar(
        "Vous n'avez pas la permission de modifier les ventes",
        "error"
      );
      return;
    }
    setVenteToEdit(vente);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    if (userRole !== "admin") {
      showSnackbar(
        "Vous n'avez pas la permission de supprimer des ventes",
        "error"
      );
      return;
    }

    // Confirmation avant suppression
    const result = await Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Cette action est irréversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer!",
      cancelButtonText: "Annuler"
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSnackbar("Vente supprimée avec succès");
        // Recharger les ventes
        const ventesRes = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVentes(ventesRes.data);
        await fetchAnalytics();
      } catch (err) {
        showSnackbar("Erreur lors de la suppression", "error");
      }
    }
  };

  const handleViewDetails = (vente) => {
    setSelectedVente(vente);
    setDetailOpen(true);
  };

  // Fonction pour rafraîchir les ventes après une modification
  const refreshVentes = async () => {
    try {
      const token = localStorage.getItem("token");
      const ventesRes = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVentes(ventesRes.data);
      await fetchAnalytics();
    } catch (err) {
      showSnackbar("Erreur lors du rafraîchissement des ventes", "error");
    }
  };

  // Filtrage des ventes
  const filteredVentes = useMemo(() => {
    return ventes.filter((vente) => {
      const matchesSearch =
        searchTerm === "" ||
        Object.values(vente).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesClient =
        filterClient === "" || 
        (vente.client_nom && vente.client_nom.includes(filterClient));
      
      const matchesPiece =
        filterPiece === "" || 
        (vente.piece_nom && vente.piece_nom.includes(filterPiece));
      
      const matchesStatus =
        filterStatus === "all" || vente.status === filterStatus;

      let matchesDate = true;
      if (filterDateStart) {
        matchesDate = matchesDate && vente.date_vente >= filterDateStart;
      }
      if (filterDateEnd) {
        matchesDate = matchesDate && vente.date_vente <= filterDateEnd;
      }

      return (
        matchesSearch &&
        matchesClient &&
        matchesPiece &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [ventes, searchTerm, filterClient, filterPiece, filterStatus, filterDateStart, filterDateEnd]);

  const resetFilters = () => {
    setSearchTerm("");
    setFilterClient("");
    setFilterPiece("");
    setFilterDateStart("");
    setFilterDateEnd("");
    setFilterStatus("all");
    setPage(0);
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = [
      "Date",
      "Pièce",
      "Client",
      "Quantité",
      "Prix Unitaire",
      "Réduction",
      "Prix Total",
      "Statut",
      "Notes",
    ].join(",");
    
    const csvContent = filteredVentes
      .map((vente) =>
        [
          `"${vente.date_vente}"`,
          `"${vente.piece_nom}"`,
          `"${vente.client_nom}"`,
          vente.quantite,
          vente.prix_unitaire,
          vente.reduction,
          vente.prix_total,
          `"${vente.status}"`,
          `"${vente.notes || ''}"`,
        ].join(",")
      )
      .join("\n");

    const blob = new Blob([headers + "\n" + csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ventes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showSnackbar("Export CSV généré avec succès");
  };

  // Fonction pour imprimer une facture
  const printInvoice = (vente) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
     <!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${vente.id}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary: #2563eb;
            --primary-dark: #1d4ed8;
            --secondary: #64748b;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --light: #f8fafc;
            --dark: #1e293b;
            --gray-100: #f1f5f9;
            --gray-200: #e2e8f0;
            --gray-300: #cbd5e1;
            --gray-400: #94a3b8;
            --gray-500: #64748b;
            --gray-600: #475569;
            --gray-700: #334155;
            --gray-800: #1e293b;
            --gray-900: #0f172a;
            --border-radius: 12px;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --transition: all 0.3s ease;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--gray-800);
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 2rem;
            min-height: 100vh;
        }

        .invoice-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            overflow: hidden;
        }

        /* Header Styles */
        .invoice-header {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 2rem;
            padding: 2.5rem;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
        }

        .company-info {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .logo-icon {
            font-size: 2rem;
        }

        .company-details {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .invoice-meta {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.75rem;
        }

        .invoice-title {
            font-size: 2.5rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .invoice-number {
            font-size: 1.1rem;
            font-weight: 500;
            background: rgba(255, 255, 255, 0.15);
            padding: 0.5rem 1rem;
            border-radius: 30px;
        }

        .invoice-date {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.95rem;
        }

        .status-badge {
            padding: 0.5rem 1.25rem;
            border-radius: 30px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-completed {
            background-color: var(--success);
        }

        .status-pending {
            background-color: var(--warning);
        }

        .status-cancelled {
            background-color: var(--danger);
        }

        /* Content Sections */
        .invoice-content {
            padding: 2.5rem;
        }

        .section {
            margin-bottom: 2.5rem;
        }

        .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--primary);
            padding-bottom: 0.75rem;
            margin-bottom: 1.5rem;
            border-bottom: 2px solid var(--gray-200);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .section-title i {
            font-size: 1.1rem;
        }

        /* Client Information */
        .client-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }

        .info-card {
            background: var(--gray-100);
            padding: 1.25rem;
            border-radius: var(--border-radius);
            border-left: 4px solid var(--primary);
        }

        .info-label {
            font-size: 0.8rem;
            font-weight: 500;
            color: var(--gray-500);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
        }

        .info-value {
            font-size: 1rem;
            font-weight: 500;
            color: var(--gray-800);
        }

        /* Items Table */
        .items-container {
            overflow-x: auto;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
        }

        .items-table th {
            background: var(--gray-100);
            padding: 1rem 1.25rem;
            text-align: left;
            font-weight: 600;
            color: var(--gray-700);
            border-bottom: 1px solid var(--gray-200);
        }

        .items-table td {
            padding: 1.25rem;
            border-bottom: 1px solid var(--gray-200);
        }

        .items-table tr:last-child td {
            border-bottom: none;
        }

        .items-table tr {
            transition: var(--transition);
        }

        .items-table tr:hover {
            background: var(--gray-50);
        }

        /* Notes Section */
        .notes-card {
            background: var(--gray-100);
            padding: 1.25rem;
            border-radius: var(--border-radius);
            margin-top: 1.5rem;
        }

        /* Totals Section */
        .totals-container {
            display: flex;
            justify-content: flex-end;
        }

        .totals-card {
            width: 350px;
            background: var(--gray-100);
            padding: 1.5rem;
            border-radius: var(--border-radius);
        }

        .total-line {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--gray-200);
        }

        .total-line:last-child {
            border-bottom: none;
        }

        .grand-total {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--primary);
        }

        /* Footer */
        .invoice-footer {
            padding: 2.5rem;
            background: var(--gray-100);
            border-top: 1px solid var(--gray-200);
        }

        .payment-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .payment-card {
            background: white;
            padding: 1.25rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-sm);
        }

        .payment-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--primary);
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .company-footer {
            text-align: center;
            padding-top: 1.5rem;
            border-top: 1px solid var(--gray-200);
            color: var(--gray-600);
            font-size: 0.9rem;
        }

        /* Action Buttons */
        .action-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: var(--border-radius);
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            transition: var(--transition);
            border: none;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
        }

        .btn-primary:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: var(--shadow);
        }

        .btn-outline {
            background: transparent;
            color: var(--primary);
            border: 1px solid var(--primary);
        }

        .btn-outline:hover {
            background: var(--primary);
            color: white;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            body {
                padding: 1rem;
            }
            
            .invoice-header {
                grid-template-columns: 1fr;
                text-align: center;
                gap: 1.5rem;
            }
            
            .invoice-meta {
                align-items: center;
            }
            
            .client-grid, .payment-info {
                grid-template-columns: 1fr;
            }
            
            .totals-container {
                justify-content: stretch;
            }
            
            .totals-card {
                width: 100%;
            }
            
            .action-buttons {
                flex-direction: column;
            }
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .invoice-container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .action-buttons {
                display: none;
            }
            
            .invoice-header {
                background: #f1f5f9;
                color: var(--gray-800);
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }

        /* Animation */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .invoice-container {
            animation: fadeIn 0.5s ease-out;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <header class="invoice-header">
            <div class="company-info">
                <div class="logo">
                    <i class="fas fa-car-alt logo-icon"></i>
                    <span>AUTO PIÈCES EXPERT</span>
                </div>
                <div class="company-details">
                    <span>123 Rue du Commerce, 75001 Paris, France</span>
                    <span>Tél: 01 23 45 67 89 | Email: contact@autopiecesexpert.fr</span>
                    <span>SIRET: 123 456 789 00012</span>
                </div>
            </div>
            
            <div class="invoice-meta">
                <h1 class="invoice-title">Facture</h1>
                <div class="invoice-number">${
                  "FAC-" + vente.id.toString().padStart(6, "0")
                }</div>
                <div class="invoice-date">
                    <i class="far fa-calendar-alt"></i>
                    <span>${new Date(vente.date_vente).toLocaleDateString(
                      "fr-FR"
                    )}</span>
                </div>
                <div class="status-badge status-${vente.status}">
                    ${
                      vente.status === "completed"
                        ? "Payée"
                        : vente.status === "pending"
                        ? "En attente"
                        : "Annulée"
                    }
                </div>
            </div>
        </header>
        
        <main class="invoice-content">
            <section class="section">
                <h2 class="section-title">
                    <i class="fas fa-user-circle"></i>
                    Informations Client
                </h2>
                
                <div class="client-grid">
                    <div class="info-card">
                        <div class="info-label">ID Client</div>
                        <div class="info-value">${vente.client_id}</div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-label">Nom Complet</div>
                        <div class="info-value">${vente.client_nom} ${
      vente.client_prenom || ""
    }</div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-label">Email</div>
                        <div class="info-value">${
                          vente.client_email || "Non renseigné"
                        }</div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-label">Téléphone</div>
                        <div class="info-value">${
                          vente.client_phone || "Non renseigné"
                        }</div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-label">Adresse</div>
                        <div class="info-value">${
                          vente.client_address || "Non renseignée"
                        }</div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-label">Statut Client</div>
                        <div class="info-value">${
                          vente.client_status || "Actif"
                        }</div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-label">Client depuis</div>
                        <div class="info-value">${
                          vente.client_createdAt
                            ? new Date(
                                vente.client_createdAt
                              ).toLocaleDateString("fr-FR")
                            : "Non spécifié"
                        }</div>
                    </div>
                </div>
            </section>
            
            <section class="section">
                <h2 class="section-title">
                    <i class="fas fa-file-invoice-dollar"></i>
                    Détails de la Vente
                </h2>
                
                <div class="items-container">
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Référence</th>
                                <th>Description</th>
                                <th>Quantité</th>
                                <th>Prix unitaire</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${vente.piece_reference}</td>
                                <td>${vente.piece_nom}</td>
                                <td>${vente.quantite}</td>
                                <td>${Number(vente.prix_unitaire || 0).toFixed(
                                  2
                                )} €</td>
                                <td>${Number(vente.prix_total || 0).toFixed(
                                  2
                                )} €</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                ${
                  vente.notes
                    ? `
                <div class="notes-card">
                    <div class="info-label">Notes</div>
                    <div class="info-value">${vente.notes}</div>
                </div>
                `
                    : ""
                }
            </section>
            
            <section class="section">
                <div class="totals-container">
                    <div class="totals-card">
                        <div class="total-line">
                            <span>Sous-total:</span>
                            <span>${Number(vente.prix_total || 0).toFixed(
                              2
                            )} €</span>
                        </div>
                        
                        ${
                          vente.reduction > 0
                            ? `
                        <div class="total-line">
                            <span>Réduction:</span>
                            <span>-${Number(vente.reduction || 0).toFixed(
                              2
                            )} €</span>
                        </div>
                        `
                            : ""
                        }
                        
                        <div class="total-line grand-total">
                            <span>Total TTC:</span>
                            <span>${Number(
                              (vente.prix_total || 0) - (vente.reduction || 0)
                            ).toFixed(2)} €</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
        
        <footer class="invoice-footer">
            <div class="payment-info">
                <div class="payment-card">
                    <h3 class="payment-title">
                        <i class="fas fa-credit-card"></i>
                        Informations de paiement
                    </h3>
                    <p>Date limite: ${new Date(
                      new Date(vente.date_vente).setDate(
                        new Date(vente.date_vente).getDate() + 30
                      )
                    ).toLocaleDateString("fr-FR")}</p>
                    <p>Mode: Carte bancaire</p>
                    <p>RIB: FR76 1234 5123 4512 3456 7890 123</p>
                </div>
                
                <div class="payment-card">
                    <h3 class="payment-title">
                        <i class="fas fa-info-circle"></i>
                        Informations légales
                    </h3>
                    <p>Cet document fait office de facture au sens de l'article 289 du CGI</p>
                    <p>TVA non applicable, art. 293 B du CGI</p>
                </div>
            </div>
            
            <div class="company-footer">
                <p>Merci pour votre confiance et à bientôt !</p>
                <p>AutoPièces Expert - spécialiste des pièces automobiles depuis 2005</p>
            </div>
        </footer>
    </div>
    
    <div class="action-buttons">
        <button class="btn btn-primary" onclick="window.print()">
            <i class="fas fa-print"></i>
            Imprimer la facture
        </button>
        <button class="btn btn-outline" onclick="downloadPDF()">
            <i class="fas fa-download"></i>
            Télécharger PDF
        </button>
    </div>

    <script>
        function downloadPDF() {
            // Fonctionnalité de téléchargement PDF à implémenter
            // Pourrait utiliser des bibliothèques comme jsPDF ou html2pdf.js
            alert("Fonctionnalité de téléchargement PDF à implémenter");
        }
    </script>
</body>
</html>
   `);
    printWindow.document.close();
    printWindow.print();
  };

  // Rendu conditionnel selon l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case "analytics":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Tableau de Bord Analytique
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {analytics.totalVentes}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                          Ventes Totales
                        </Typography>
                      </Box>
                      <ShoppingCart sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </StatsCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatsCard sx={{ background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)" }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {analytics.chiffreAffaires.toFixed(2)}€
                        </Typography>
                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                          Chiffre d'Affaires
                        </Typography>
                      </Box>
                      <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </StatsCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatsCard sx={{ background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)" }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {analytics.ventesAujourdhui}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                          Ventes Aujourd'hui
                        </Typography>
                      </Box>
                      <DateRange sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </StatsCard>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <StatsCard sx={{ background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)" }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                          {analytics.moyenneVente.toFixed(2)}€
                        </Typography>
                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                          Panier Moyen
                        </Typography>
                      </Box>
                      <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </StatsCard>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Pièces les Plus Vendues
                    </Typography>
                    <List>
                      {analytics.topPieces.slice(0, 5).map((piece, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Inventory />
                          </ListItemIcon>
                          <ListItemText 
                            primary={piece.nom} 
                            secondary={`${piece.quantite_vendue} unités vendues`} 
                          />
                          <Chip label={`${piece.chiffre_affaires.toFixed(2)}€`} color="primary" />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Meilleurs Clients
                    </Typography>
                    <List>
                      {analytics.topClients.slice(0, 5).map((client, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Person />
                          </ListItemIcon>
                          <ListItemText 
                            primary={client.nom} 
                            secondary={`${client.nb_achats} achats`} 
                          />
                          <Chip label={`${client.montant_total.toFixed(2)}€`} color="secondary" />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      
      case "stock":
        return <StockManagement />;
      
      case "ventes":
      default:
        return (
          <>
            {/* Filtres */}
            <Box sx={{ p: 2, background: "rgba(231, 76, 60, 0.05)", display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center" }}>
                <FilterList sx={{ mr: 1 }} /> Filtres:
              </Typography>

              <TextField
                label="Date début"
                type="date"
                size="small"
                value={filterDateStart}
                onChange={(e) => setFilterDateStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />

              <TextField
                label="Date fin"
                type="date"
                size="small"
                value={filterDateEnd}
                onChange={(e) => setFilterDateEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />

              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Statut"
                >
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="completed">Terminé</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="cancelled">Annulé</MenuItem>
                </Select>
              </FormControl>

              <Button variant="outlined" onClick={resetFilters} size="small">
                Réinitialiser
              </Button>

              <Typography variant="body2" sx={{ ml: "auto" }}>
                {filteredVentes.length} vente(s) trouvée(s)
              </Typography>
            </Box>

            {/* Tableau des ventes */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: "linear-gradient(135deg, #2c3e50 0%, #1a2a4a 100%)" }}>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Pièce</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Client</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Quantité</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Prix Unit.</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Réduction</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Total</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Statut</TableCell>
                    <TableCell align="right" sx={{ color: "white", fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    [...Array(rowsPerPage)].map((_, index) => (
                      <TableRow key={index}>
                        {[...Array(9)].map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton animation="wave" height={40} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredVentes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <ShoppingBag sx={{ fontSize: 60, color: "text.disabled", mb: 1 }} />
                          <Typography variant="h6" color="text.secondary">
                            Aucune vente trouvée
                          </Typography>
                          <Button onClick={() => setOpenForm(true)} startIcon={<Add />} sx={{ mt: 2 }}>
                            Ajouter une vente
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVentes
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((vente) => (
                        <PremiumTableRow key={vente.id}>
                          <TableCell>
                            {new Date(vente.date_vente).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>
                            <Chip label={vente.piece_nom} color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Person color="action" />
                              {vente.client_nom}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600 }}>{vente.quantite}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Euro color="action" />
                              {Number(vente.prix_unitaire || 0).toFixed(2)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {vente.reduction > 0 ? (
                              <Chip label={`-${vente.reduction}€`} color="secondary" size="small" />
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700, color: "success.main" }}>
                              {Number(vente.prix_total || 0).toFixed(2)} €
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                vente.status === "completed"
                                  ? "Terminé"
                                  : vente.status === "pending"
                                  ? "En attente"
                                  : "Annulé"
                              }
                              color={
                                vente.status === "completed"
                                  ? "success"
                                  : vente.status === "pending"
                                  ? "warning"
                                  : "error"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Voir détails">
                              <IconButton onClick={() => handleViewDetails(vente)}>
                                <Visibility color="info" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Imprimer facture">
                              <IconButton onClick={() => printInvoice(vente)}>
                                <Print color="action" />
                              </IconButton>
                            </Tooltip>
                            {userRole === "admin" && (
                              <>
                                <Tooltip title="Modifier">
                                  <IconButton onClick={() => handleEdit(vente)}>
                                    <Edit color="primary" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Supprimer">
                                  <IconButton onClick={() => handleDelete(vente.id)}>
                                    <Delete color="error" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </TableCell>
                        </PremiumTableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredVentes.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        );
    }
  };

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        {/* Notification Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        <Paper sx={{ borderRadius: 4, overflow: "hidden", boxShadow: 3 }}>
          {/* En-tête */}
          <Box
            sx={{
              p: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)",
              color: "white",
              flexWrap: { xs: "wrap", md: "nowrap" },
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ShoppingCart sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Gestion des Ventes
                </Typography>
                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                  Système de vente de pièces automobiles
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: { xs: "wrap", md: "nowrap" },
              }}
            >
              <TextField
                size="small"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "white" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 50,
                    background: "rgba(255,255,255,0.15)",
                    color: "white",
                    "& .MuiInputBase-input::placeholder": {
                      color: "rgba(255,255,255,0.7)",
                    },
                  },
                }}
              />

              <Tooltip title="Actualiser">
                <IconButton sx={{ color: "white" }} onClick={handleRefresh}>
                  {isRefreshing ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <Refresh />
                  )}
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setVenteToEdit(null);
                  setOpenForm(true);
                }}
                sx={{
                  borderRadius: 50,
                  background: "rgba(255,255,255,0.2)",
                  "&:hover": { background: "rgba(255,255,255,0.3)" },
                }}
              >
                Nouvelle Vente
              </Button>

              <Button
                variant="contained"
                onClick={exportToCSV}
                startIcon={<FileDownload />}
                sx={{
                  borderRadius: 50,
                  background: "rgba(255,255,255,0.2)",
                  "&:hover": { background: "rgba(255,255,255,0.3)" },
                }}
              >
                Export CSV
              </Button>
            </Box>
          </Box>

    {     /*
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant={activeTab === "ventes" ? "contained" : "text"}
                onClick={() => setActiveTab("ventes")}
                startIcon={<ShoppingCart />}
                sx={{ mx: 1, borderRadius: 2 }}
              >
                Ventes
              </Button>
              <Button
                variant={activeTab === "analytics" ? "contained" : "text"}
                onClick={() => setActiveTab("analytics")}
                startIcon={<Analytics />}
                sx={{ mx: 1, borderRadius: 2 }}
              >
                Analytics
              </Button>
              <Button
                variant={activeTab === "stock" ? "contained" : "text"}
                onClick={() => setActiveTab("stock")}
                startIcon={<Inventory />}
                sx={{ mx: 1, borderRadius: 2 }}
              >
                Stock
              </Button>
            </Box>
          </Box>
</Fade> */}
          
          {renderTabContent()}
        </Paper>

        {/* Dialogue de formulaire de vente */}
        <VentesForm
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setVenteToEdit(null);
          }}
          venteToEdit={venteToEdit}
          pieces={Array.isArray(pieces) ? pieces : []}
          clients={Array.isArray(clients) ? clients : []}
          refreshVentes={refreshVentes}
        />

        {/* Dialogue de détail de vente */}
        <Dialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h5">Détails de la vente</Typography>
            <IconButton onClick={() => setDetailOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedVente && (
              <Box sx={{ p: 2 }}>
                {/* En-tête de la facture */}
                <Box
                  sx={{
                    textAlign: "center",
                    mb: 4,
                    p: 3,
                    backgroundColor: "#f8f9fa",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h4" gutterBottom>
                    FACTURE DE VENTE
                  </Typography>
                  <Typography variant="h6" color="primary">
                    N° {selectedVente.id.toString().padStart(6, "0")}
                  </Typography>
                  <Typography variant="body1">
                    Date:{" "}
                    {new Date(selectedVente.date_vente).toLocaleDateString(
                      "fr-FR"
                    )}
                  </Typography>
                </Box>

                <Grid container spacing={4}>
                  {/* Informations client */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        <Person sx={{ mr: 1, verticalAlign: "middle" }} />
                        Informations Client
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Nom:</strong> {selectedVente.client_nom}
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Informations pièce */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        <ShoppingCart sx={{ mr: 1, verticalAlign: "middle" }} />
                        Détails du Produit
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Pièce:</strong> {selectedVente.piece_nom}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Quantité:</strong> {selectedVente.quantite}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>Prix unitaire:</strong>{" "}
                        {Number(selectedVente?.prix_unitaire ?? 0).toFixed(2)} €
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Détails financiers */}
                  <Grid item xs={12}>
                    <Card sx={{ p: 3, backgroundColor: "#f0f7ff" }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        <AttachMoney sx={{ mr: 1, verticalAlign: "middle" }} />
                        Détails Financiers
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography variant="body1">Sous-total:</Typography>
                        <Typography variant="body1">
                          {(
                            selectedVente.quantite * selectedVente.prix_unitaire
                          ).toFixed(2)}{" "}
                          €
                        </Typography>
                      </Box>

                      {selectedVente.reduction > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Typography variant="body1" color="secondary">
                            Réduction:
                          </Typography>
                          <Typography variant="body1" color="secondary">
                            -{Number(selectedVente?.reduction ?? 0).toFixed(2)}{" "}
                            €
                          </Typography>
                        </Box>
                      )}

                      <Divider sx={{ my: 2 }} />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h5" color="primary">
                          Total:
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {Number(selectedVente?.prix_total ?? 0).toFixed(2)} €
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>

                  {/* Statut et notes */}
                  <Grid item xs={12}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Informations Complémentaires
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Typography variant="body1" sx={{ mr: 2 }}>
                          <strong>Statut:</strong>
                        </Typography>
                        <Chip
                          label={
                            selectedVente.status === "completed"
                              ? "Terminé"
                              : selectedVente.status === "pending"
                              ? "En attente"
                              : "Annulé"
                          }
                          color={
                            selectedVente.status === "completed"
                              ? "success"
                              : selectedVente.status === "pending"
                              ? "warning"
                              : "error"
                          }
                        />
                      </Box>

                      {selectedVente.notes && (
                        <Box>
                          <Typography variant="body1" gutterBottom>
                            <strong>Notes:</strong>
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontStyle: "italic",
                              p: 1,
                              backgroundColor: "#f5f5f5",
                              borderRadius: 1,
                            }}
                          >
                            {selectedVente.notes}
                          </Typography>
                        </Box>
                      )}
                    </Card>
                  </Grid>
                </Grid>

                {/* Actions pour admin */}
                {userRole === "admin" && (
                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      gap: 2,
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Edit />}
                      onClick={() => {
                        setDetailOpen(false);
                        handleEdit(selectedVente);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Print />}
                      onClick={() => printInvoice(selectedVente)}
                    >
                      Imprimer
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => {
                        setDetailOpen(false);
                        handleDelete(selectedVente.id);
                      }}
                    >
                      Supprimer
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default Ventes;