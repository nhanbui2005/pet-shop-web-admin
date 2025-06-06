import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Tooltip as MuiTooltip,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';

interface Discount {
  id: number;
  name: string;
  type: 'percent' | 'amount';
  value: number;
  status: 'active' | 'inactive';
}

const discounts: Discount[] = [
  { id: 1, name: 'Hội viên Vàng', type: 'percent', value: 10, status: 'active' },
  { id: 2, name: 'Giảm giá mùa hè', type: 'amount', value: 50000, status: 'active' },
];

const servicePrices: Record<string, number> = {
  Grooming: 300000,
  Vaccination: 400000,
  'Check-up': 200000,
  Training: 500000,
  Surgery: 2000000,
  'Dental Cleaning': 600000,
};

interface Appointment {
  id: number;
  customerName: string;
  petName: string;
  service: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  discountId?: number;
}

const initialAppointments: Appointment[] = [
  {
    id: 1,
    customerName: 'John Doe',
    petName: 'Max',
    service: 'Grooming',
    date: '2024-03-20',
    time: '10:00 AM',
    status: 'scheduled',
    notes: 'Regular grooming session',
  },
  {
    id: 2,
    customerName: 'Jane Smith',
    petName: 'Luna',
    service: 'Vaccination',
    date: '2024-03-20',
    time: '2:30 PM',
    status: 'scheduled',
    notes: 'Annual vaccination',
  },
  {
    id: 3,
    customerName: 'Mike Johnson',
    petName: 'Rocky',
    service: 'Check-up',
    date: '2024-03-21',
    time: '11:00 AM',
    status: 'completed',
    notes: 'Regular health check',
  },
];

const services = [
  'Grooming',
  'Vaccination',
  'Check-up',
  'Training',
  'Surgery',
  'Dental Cleaning',
];

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [open, setOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<Partial<Appointment>>({
    customerName: '',
    petName: '',
    service: '',
    date: '',
    time: '',
    status: 'scheduled',
    notes: '',
    discountId: undefined,
  });

  const handleClickOpen = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData(appointment);
    } else {
      setEditingAppointment(null);
      setFormData({
        customerName: '',
        petName: '',
        service: '',
        date: '',
        time: '',
        status: 'scheduled',
        notes: '',
        discountId: undefined,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAppointment(null);
  };

  const handleSubmit = () => {
    if (editingAppointment) {
      setAppointments(
        appointments.map((a) =>
          a.id === editingAppointment.id ? { ...a, ...formData } : a
        )
      );
    } else {
      setAppointments([
        ...appointments,
        {
          id: appointments.length + 1,
          ...formData,
        } as Appointment,
      ]);
    }
    handleClose();
  };

  const handleDelete = (id: number) => {
    setAppointments(appointments.filter((a) => a.id !== id));
  };

  const handleStatusChange = (id: number, newStatus: Appointment['status']) => {
    setAppointments(
      appointments.map((a) =>
        a.id === id ? { ...a, status: newStatus } : a
      )
    );
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDiscount = (id?: number) => discounts.find(d => d.id === id);
  const calcFinalPrice = (service: string, discountId?: number) => {
    const price = servicePrices[service] || 0;
    const discount = getDiscount(discountId);
    if (!discount || discount.status !== 'active') return price;
    if (discount.type === 'percent') return Math.max(0, price - (price * discount.value) / 100);
    if (discount.type === 'amount') return Math.max(0, price - discount.value);
    return price;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 1 }}>
          Appointments Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleClickOpen()}
          sx={{ background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)', fontWeight: 600, borderRadius: 2, boxShadow: 2 }}
        >
          Add Appointment
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        {appointments.map((appointment, idx) => (
          <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6', lg: 'span 4' } }} key={appointment.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                bgcolor: idx % 2 === 0 ? '#f4faff' : '#e3f2fd',
                border: '1.5px solid #2196f322',
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': { boxShadow: 8, transform: 'translateY(-4px) scale(1.02)' },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EventAvailableIcon color="primary" />
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {appointment.service}
                  </Typography>
                  <MuiTooltip title={appointment.status === 'scheduled' ? 'Đã lên lịch' : appointment.status === 'completed' ? 'Đã hoàn thành' : 'Đã hủy'} arrow>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                      sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                    />
                  </MuiTooltip>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PersonIcon color="info" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {appointment.customerName}
                  </Typography>
                  <PetsIcon color="success" fontSize="small" sx={{ ml: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {appointment.petName}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ngày: <b>{appointment.date}</b> &nbsp;|&nbsp; Giờ: <b>{appointment.time}</b>
                </Typography>
                {appointment.discountId && getDiscount(appointment.discountId) && (
                  <MuiTooltip title={`Chương trình: ${getDiscount(appointment.discountId)?.name}` + (getDiscount(appointment.discountId)?.type === 'percent' ? ` (-${getDiscount(appointment.discountId)?.value}%)` : ` (-${getDiscount(appointment.discountId)?.value.toLocaleString()}đ)`)} arrow>
                    <Chip
                      label={getDiscount(appointment.discountId)?.name}
                      color="info"
                      size="small"
                      sx={{ fontWeight: 600, mb: 1 }}
                    />
                  </MuiTooltip>
                )}
                <Typography variant="body2" color="primary" sx={{ fontWeight: 700, mt: 1 }}>
                  {appointment.service && servicePrices[appointment.service]
                    ? `Tổng tiền: ${calcFinalPrice(appointment.service, appointment.discountId).toLocaleString()}đ`
                    : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 32 }}>
                  {appointment.notes.length > 40 ? appointment.notes.slice(0, 40) + '...' : appointment.notes}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <MuiTooltip title="Chỉnh sửa lịch hẹn" arrow>
                    <IconButton
                      color="primary"
                      onClick={() => handleClickOpen(appointment)}
                    >
                      <EditIcon />
                    </IconButton>
                  </MuiTooltip>
                  <MuiTooltip title="Xóa lịch hẹn" arrow>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(appointment.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </MuiTooltip>
                  {appointment.status === 'scheduled' && (
                    <>
                      <MuiTooltip title="Đánh dấu hoàn thành" arrow>
                        <IconButton
                          color="success"
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </MuiTooltip>
                      <MuiTooltip title="Hủy lịch hẹn" arrow>
                        <IconButton
                          color="error"
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        >
                          <CancelIcon />
                        </IconButton>
                      </MuiTooltip>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 700 }}>
          {editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2, mt: 1 }}>
            <Box sx={{ gridColumn: 'span 12' }}>
              <TextField
                fullWidth
                label="Customer Name"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                sx={{ mb: 1 }}
                color="primary"
              />
            </Box>
            <Box sx={{ gridColumn: 'span 12' }}>
              <TextField
                fullWidth
                label="Pet Name"
                value={formData.petName}
                onChange={(e) =>
                  setFormData({ ...formData, petName: e.target.value })
                }
                sx={{ mb: 1 }}
                color="primary"
              />
            </Box>
            <Box sx={{ gridColumn: 'span 12' }}>
              <TextField
                fullWidth
                select
                label="Service"
                value={formData.service}
                onChange={(e) =>
                  setFormData({ ...formData, service: e.target.value })
                }
                sx={{ mb: 1 }}
                color="primary"
              >
                {services.map((service) => (
                  <MenuItem key={service} value={service}>
                    {service}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 1 }}
                color="primary"
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <TextField
                fullWidth
                type="time"
                label="Time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 1 }}
                color="primary"
              />
            </Box>
            <Box sx={{ gridColumn: 'span 12' }}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                sx={{ mb: 1 }}
                color="primary"
              />
            </Box>
            <Box sx={{ gridColumn: 'span 12' }}>
              <FormControl fullWidth sx={{ mb: 1 }} color="primary">
                <InputLabel>Chương trình giảm giá</InputLabel>
                <Select
                  value={formData.discountId || ''}
                  label="Chương trình giảm giá"
                  onChange={e => setFormData({ ...formData, discountId: e.target.value ? Number(e.target.value) : undefined })}
                >
                  <MenuItem value="">Không áp dụng</MenuItem>
                  {discounts.filter(d => d.status === 'active').map(d => (
                    <MenuItem value={d.id} key={d.id}>
                      {d.name} {d.type === 'percent' ? `(-${d.value}%)` : `(-${d.value.toLocaleString()}đ)`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: 'grey.600', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)', fontWeight: 600, borderRadius: 2 }}>
            {editingAppointment ? 'Save Changes' : 'Add Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments; 