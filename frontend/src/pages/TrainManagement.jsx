import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import useTrains from '../hooks/useTrains';
import TrainList from '../components/TrainList';
import TrainForm from '../components/TrainForm';
import * as trainService from '../services/trainService';
import vi from '@/lib/translations';

export default function TrainManagement() {
  const { trains, loading, fetchTrains } = useTrains();
  const [editingTrain, setEditingTrain] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (data) => {
    try {
      if (editingTrain) {
        await trainService.updateTrain(editingTrain.id, data);
      } else {
        await trainService.createTrain(data);
      }
      setEditingTrain(null);
      setShowForm(false);
      fetchTrains();
    } catch (err) {
      console.error('Error saving train:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await trainService.deleteTrain(id);
      fetchTrains();
    } catch (err) {
      console.error('Error deleting train:', err);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await trainService.updateTrainStatus(id, newStatus);
      fetchTrains();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleEdit = (train) => {
    setEditingTrain(train);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingTrain(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{vi.trains.title}</h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            {vi.trains.description}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {vi.trains.addTrain}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTrain ? vi.trains.editTrain : vi.trains.addNewTrain}</CardTitle>
            <CardDescription>
              {editingTrain ? vi.trains.updateTrainInfo : vi.trains.enterDetails}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrainForm 
              initialData={editingTrain} 
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{vi.trains.trainList}</CardTitle>
          <CardDescription>
            {vi.trains.viewAndManage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">{vi.trains.loadingTrains}</div>
          ) : trains.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {vi.trains.noTrains}
            </div>
          ) : (
            <TrainList
              trains={trains}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusUpdate={handleStatusUpdate}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
