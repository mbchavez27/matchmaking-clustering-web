import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Search, X, User } from 'lucide-react';
import { Button } from './ui/button';

interface ClusterData {
  cluster_id: number;
  members: Array<{
    id: number;
    data: Record<string, any>;
  }>;
  size: number;
  label?: string;
}

interface PersonSearchProps {
  clusters: ClusterData[];
  clusterNames: Record<number, string>;
  onSelectCluster: (clusterId: number) => void;
}

export function PersonSearch({ clusters, clusterNames, onSelectCluster }: PersonSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    member: any;
    clusterId: number;
    clusterName: string;
    matchedFields: string[];
  }>>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: Array<{
      member: any;
      clusterId: number;
      clusterName: string;
      matchedFields: string[];
    }> = [];

    const lowerQuery = query.toLowerCase();

    clusters.forEach((cluster) => {
      cluster.members.forEach((member) => {
        const matchedFields: string[] = [];
        
        // Search through all fields in the member data
        Object.entries(member.data).forEach(([key, value]) => {
          if (value && String(value).toLowerCase().includes(lowerQuery)) {
            matchedFields.push(key);
          }
        });

        if (matchedFields.length > 0) {
          results.push({
            member: member.data,
            clusterId: cluster.cluster_id,
            clusterName: clusterNames[cluster.cluster_id] || `Cluster ${cluster.cluster_id}`,
            matchedFields,
          });
        }
      });
    });

    setSearchResults(results);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const clusterColors = [
    'bg-blue-100 text-blue-800 hover:bg-blue-200',
    'bg-green-100 text-green-800 hover:bg-green-200',
    'bg-purple-100 text-purple-800 hover:bg-purple-200',
    'bg-orange-100 text-orange-800 hover:bg-orange-200',
    'bg-pink-100 text-pink-800 hover:bg-pink-200',
    'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
    'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    'bg-red-100 text-red-800 hover:bg-red-200',
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label htmlFor="person-search" className="text-sm font-medium text-gray-700">
          Search for a Person
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="person-search"
            type="text"
            placeholder="Search by name, email, or any field..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10 border-gray-200 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-medium text-gray-700">
              Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </p>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-wrap gap-3 items-center">
                        {Object.entries(result.member)
                          .filter(([key]) => !key.includes('cluster'))
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <span key={key} className="text-sm">
                              <span className="font-medium text-gray-700">{key}:</span>{' '}
                              <span className="text-gray-900">{String(value)}</span>
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center text-xs text-gray-400">
                      <span>Matched:</span>
                      {result.matchedFields.map((field) => (
                        <Badge key={field} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectCluster(result.clusterId)}
                    className={`${clusterColors[result.clusterId % clusterColors.length]} shadow-sm`}
                  >
                    <span className="font-medium">{result.clusterName}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchQuery && searchResults.length === 0 && (
        <div className="border border-gray-200 rounded-lg bg-gray-50 p-12 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}