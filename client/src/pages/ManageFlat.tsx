import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFlats, createFlat, updateFlat, deleteFlat } from '../redux/slice/flatSlice';
import { Table, Thead, Tbody, Tr, Th, Td, Button, Badge, Dialog, Input, Spinner } from '../component/ui';
import { Home, Search, Edit2, Trash2 } from 'lucide-react';

function ManageFlat() {
  const dispatch = useDispatch<any>();
  const { flats, loading } = useSelector((state: any) => state.flat);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editFlatId, setEditFlatId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    flatNumber: '',
    block: '',
    floor: '',
    isOccupied: 'none',
  });

  useEffect(() => {
    dispatch(fetchFlats());
  }, [dispatch]);

  const filteredFlats = flats.filter((flat: any) => {
    const blockMatch = flat.block?.toLowerCase().includes(searchTerm.toLowerCase());
    const numberMatch = flat.flatNumber?.toString().includes(searchTerm);
    return blockMatch || numberMatch;
  });

  const handleOpenDialog = (flat: any = null) => {
    if (flat) {
      setEditFlatId(flat._id);
      setFormData({
        flatNumber: flat.flatNumber?.toString() || '',
        block: flat.block || '',
        floor: flat.floor?.toString() || '',
        isOccupied: flat.isOccupied !== undefined ? flat.isOccupied.toString() : 'none',
      });
    } else {
      setEditFlatId(null);
      setFormData({ flatNumber: '', block: '', floor: '', isOccupied: 'none' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.block.trim()) {
      alert('Block is a mandatory field.');
      return;
    }
    if (!formData.floor.toString().trim()) {
      alert('Floor is a mandatory field.');
      return;
    }
    if (isNaN(Number(formData.floor))) {
      alert('Floor must be a valid number.');
      return;
    }
    if (!formData.flatNumber.toString().trim()) {
      alert('Flat Number is a mandatory field.');
      return;
    }
    if (isNaN(Number(formData.flatNumber))) {
      alert('Flat Number must be a valid number.');
      return;
    }
    if (formData.isOccupied === 'none') {
      alert('Occupancy Status is a mandatory field. Please select Vacant or Occupied.');
      return;
    }

    const flatData = {
      flatNumber: Number(formData.flatNumber),
      block: formData.block,
      floor: Number(formData.floor),
      isOccupied: formData.isOccupied === 'true',
    };
    if (editFlatId) {
      dispatch(updateFlat({ id: editFlatId, flatData })).then(() => dispatch(fetchFlats()));
    } else {
      dispatch(createFlat(flatData)).then(() => dispatch(fetchFlats()));
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this flat?')) {
      dispatch(deleteFlat(id)).then(() => dispatch(fetchFlats()));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Flats</h1>
          <p className="text-slate-500 text-sm">View and manage all society flats.</p>
        </div>
        <Button 
          leftIcon={<Home size={18} />} 
          onClick={() => handleOpenDialog()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add New Flat
        </Button>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by block or flat number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Flats Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Spinner size="md" /></div>
        ) : (
          <Table>
             <Thead>
              <Tr hover={false}>
                <Th>Flat Number</Th>
                <Th>Block</Th>
                <Th>Floor</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredFlats.length > 0 ? (
                filteredFlats.map((flat: any) => (
                  <Tr key={flat._id}>
                    <Td className="font-medium text-slate-900">{flat.flatNumber}</Td>
                    <Td className="uppercase">{flat.block}</Td>
                    <Td>{flat.floor}</Td>
                    <Td>
                      <Badge variant={flat.isOccupied ? 'success' : 'slate'}>
                        {flat.isOccupied ? 'Occupied' : 'Vacant'}
                      </Badge>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr hover={false}>
                  <Td colSpan={4} className="text-center py-12 text-slate-500">
                    No flats found matching your search.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </div>

      {/* Add/Edit Flat Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editFlatId ? "Edit Flat" : "Add New Flat"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">{editFlatId ? "Update Flat" : "Create Flat"}</Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-1.5" htmlFor="block">
              Block
            </label>
            <input 
              id="block"
              name="block"
              type="text"
              required
              placeholder="e.g. A" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
              value={formData.block}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-1.5" htmlFor="floor">
                Floor Number
              </label>
              <input 
                id="floor"
                name="floor"
                type="text"
                pattern="[0-9]*"
                required
                placeholder="e.g. 1" 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
                value={formData.floor}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-1.5" htmlFor="flatNumber">
                Flat Number
              </label>
              <input 
                id="flatNumber"
                name="flatNumber"
                type="text"
                pattern="[0-9]*"
                required
                placeholder="e.g. 101" 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
                value={formData.flatNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-1.5" htmlFor="isOccupied">
              Occupancy Status
            </label>
            <select
              id="isOccupied"
              name="isOccupied"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
              value={formData.isOccupied}
              onChange={handleChange}
            >
              <option value="none">None</option>
              <option value="false">Vacant</option>
              <option value="true">Occupied</option>
            </select>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default ManageFlat;
