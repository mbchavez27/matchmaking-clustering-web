import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Users, TrendingUp, Download, Pencil, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { PersonSearch } from './PersonSearch';
import Papa from 'papaparse';
import { toast } from 'sonner';

interface ClusterData {
  cluster_id: number;
  members: Array<{
    id: number;
    data: Record<string, any>;
  }>;
  size: number;
  label?: string;
}

interface ClusterResultsProps {
  clusters: ClusterData[];
  totalRecords: number;
  selectedClusterFromSearch?: number | null;
}

export function ClusterResults({ clusters, totalRecords, selectedClusterFromSearch }: ClusterResultsProps) {
  const [clusterNames, setClusterNames] = useState<Record<number, string>>(() => {
    // Initialize with labels from API if available
    const initialNames: Record<number, string> = {};
    clusters.forEach(cluster => {
      if (cluster.label) {
        initialNames[cluster.cluster_id] = cluster.label;
      }
    });
    return initialNames;
  });
  const [editingCluster, setEditingCluster] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [expandedClusters, setExpandedClusters] = useState<Set<number>>(new Set());
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);

  // Handle cluster selection from search
  useEffect(() => {
    if (selectedClusterFromSearch !== null && selectedClusterFromSearch !== undefined) {
      setSelectedCluster(selectedClusterFromSearch);
      setExpandedClusters(prev => new Set(prev).add(selectedClusterFromSearch));
      
      // Scroll to the cluster card
      setTimeout(() => {
        const element = document.getElementById(`cluster-${selectedClusterFromSearch}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [selectedClusterFromSearch]);

  const clusterColors = [
    'bg-blue-100 text-blue-800 border-blue-300',
    'bg-green-100 text-green-800 border-green-300',
    'bg-purple-100 text-purple-800 border-purple-300',
    'bg-orange-100 text-orange-800 border-orange-300',
    'bg-pink-100 text-pink-800 border-pink-300',
    'bg-cyan-100 text-cyan-800 border-cyan-300',
    'bg-yellow-100 text-yellow-800 border-yellow-300',
    'bg-red-100 text-red-800 border-red-300',
  ];

  const handleStartEdit = (clusterId: number) => {
    setEditingCluster(clusterId);
    setEditValue(clusterNames[clusterId] || `Cluster ${clusterId}`);
  };

  const handleSaveEdit = (clusterId: number) => {
    setClusterNames({ ...clusterNames, [clusterId]: editValue });
    setEditingCluster(null);
  };

  const handleCancelEdit = () => {
    setEditingCluster(null);
    setEditValue('');
  };

  const toggleCluster = (clusterId: number) => {
    const newExpanded = new Set(expandedClusters);
    if (newExpanded.has(clusterId)) {
      newExpanded.delete(clusterId);
    } else {
      newExpanded.add(clusterId);
    }
    setExpandedClusters(newExpanded);
  };

  const handleSelectClusterFromSearch = (clusterId: number) => {
    setSelectedCluster(clusterId);
    setExpandedClusters(prev => new Set(prev).add(clusterId));
    
    // Scroll to the cluster card
    setTimeout(() => {
      const element = document.getElementById(`cluster-${clusterId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const downloadCSV = () => {
    // Flatten the clustered data
    const flatData = clusters.flatMap((cluster) =>
      cluster.members.map((member) => ({
        cluster_id: cluster.cluster_id,
        cluster_name: clusterNames[cluster.cluster_id] || `Cluster ${cluster.cluster_id}`,
        ...member.data,
      }))
    );

    // Convert to CSV
    const csv = Papa.unparse(flatData);
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `clustered_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Downloaded ${flatData.length} records with cluster assignments`);
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-sm text-gray-500 mb-2">Total Clusters</div>
          <div className="text-4xl font-light text-gray-900">{clusters.length}</div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-3">
            <TrendingUp className="w-4 h-4" />
            <span>Groups identified</span>
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-sm text-gray-500 mb-2">Total Records</div>
          <div className="text-4xl font-light text-gray-900">{totalRecords}</div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-3">
            <Users className="w-4 h-4" />
            <span>Processed</span>
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-sm text-gray-500 mb-2">Avg. Cluster Size</div>
          <div className="text-4xl font-light text-gray-900">
            {(totalRecords / clusters.length).toFixed(1)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-3">
            <Users className="w-4 h-4" />
            <span>Members per cluster</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={downloadCSV} variant="outline" className="shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </Button>
      </div>

      {/* Person Search */}
      <div className="border-t border-gray-100 pt-12">
        <h3 className="text-sm font-medium text-gray-900 mb-6 uppercase tracking-wide">
          Search for a Person
        </h3>
        <PersonSearch
          clusters={clusters}
          clusterNames={clusterNames}
          onSelectCluster={handleSelectClusterFromSearch}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-gray-100 pt-12">
        {clusters.map((cluster, index) => {
          const isExpanded = expandedClusters.has(cluster.cluster_id);
          const isHighlighted = selectedCluster === cluster.cluster_id;
          const displayMembers = isExpanded ? cluster.members : cluster.members.slice(0, 5);
          
          return (
            <div
              key={cluster.cluster_id}
              id={`cluster-${cluster.cluster_id}`}
              className={`bg-white border rounded-lg shadow-sm transition-all ${
                isHighlighted ? 'ring-2 ring-blue-500' : 'border-gray-200'
              }`}
            >
              <div className={`p-6 border-b ${clusterColors[index % clusterColors.length]}`}>
                <div className="flex items-center justify-between">
                  {editingCluster === cluster.cluster_id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-white border-gray-200"
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {clusterNames[cluster.cluster_id] || `Cluster ${cluster.cluster_id}`}
                        </h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(cluster.cluster_id)}
                          className="opacity-50 hover:opacity-100"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </div>
                      <Badge variant="secondary" className="bg-white/80 text-gray-700 shadow-sm">
                        {cluster.size} members
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <div className="p-6">
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {displayMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            ID: {member.id}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(member.data).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="text-sm text-gray-600">
                              <span className="font-medium text-gray-900">{key}:</span>{' '}
                              <span>{String(value)}</span>
                            </div>
                          ))}
                          {Object.keys(member.data).length > 3 && (
                            <div className="text-xs text-gray-400 italic pt-1">
                              +{Object.keys(member.data).length - 3} more fields
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {cluster.members.length > 5 && (
                      <Button
                        variant="outline"
                        className="w-full border-gray-200 shadow-sm"
                        onClick={() => toggleCluster(cluster.cluster_id)}
                      >
                        {isExpanded 
                          ? `Show Less` 
                          : `Show ${cluster.members.length - 5} More Members`
                        }
                      </Button>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}