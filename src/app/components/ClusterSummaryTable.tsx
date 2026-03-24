import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Pencil, Check, X } from 'lucide-react';
import { Badge } from './ui/badge';

interface ClusterData {
  cluster_id: number;
  members: Array<{
    id: number;
    data: Record<string, any>;
  }>;
  size: number;
}

interface ClusterSummaryTableProps {
  clusters: ClusterData[];
  clusterNames: Record<number, string>;
  onUpdateName: (clusterId: number, name: string) => void;
  onSelectCluster: (clusterId: number) => void;
}

export function ClusterSummaryTable({
  clusters,
  clusterNames,
  onUpdateName,
  onSelectCluster,
}: ClusterSummaryTableProps) {
  const [editingCluster, setEditingCluster] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (clusterId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCluster(clusterId);
    setEditValue(clusterNames[clusterId] || `Cluster ${clusterId}`);
  };

  const handleSaveEdit = (clusterId: number) => {
    onUpdateName(clusterId, editValue);
    setEditingCluster(null);
  };

  const handleCancelEdit = () => {
    setEditingCluster(null);
    setEditValue('');
  };

  const clusterColors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-orange-100 text-orange-800',
    'bg-pink-100 text-pink-800',
    'bg-cyan-100 text-cyan-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Cluster Name</TableHead>
            <TableHead className="w-32">Members</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clusters.map((cluster, index) => (
            <TableRow
              key={cluster.cluster_id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectCluster(cluster.cluster_id)}
            >
              <TableCell>
                <Badge className={clusterColors[index % clusterColors.length]}>
                  {cluster.cluster_id}
                </Badge>
              </TableCell>
              <TableCell>
                {editingCluster === cluster.cluster_id ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-8"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(cluster.cluster_id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSaveEdit(cluster.cluster_id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {clusterNames[cluster.cluster_id] || `Cluster ${cluster.cluster_id}`}
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">{cluster.size} records</span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleStartEdit(cluster.cluster_id, e)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
