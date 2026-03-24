import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ClusteringConfigProps {
  columns: string[];
  selectedColumn: string;
  onColumnSelect: (column: string) => void;
  numClusters: number;
  onNumClustersChange: (value: number) => void;
  maxDiff: number;
  onMaxDiffChange: (value: number) => void;
}

export function ClusteringConfig({
  columns,
  selectedColumn,
  onColumnSelect,
  numClusters,
  onNumClustersChange,
  maxDiff,
  onMaxDiffChange,
}: ClusteringConfigProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label htmlFor="column-select" className="text-sm font-medium text-gray-700">
          Text Column for Clustering
        </Label>
        <Select value={selectedColumn} onValueChange={onColumnSelect}>
          <SelectTrigger id="column-select" className="w-full border-gray-200 shadow-sm">
            <SelectValue placeholder="Choose a column..." />
          </SelectTrigger>
          <SelectContent>
            {columns.map((column) => (
              <SelectItem key={column} value={column}>
                {column}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-400">
          The selected column will be used for NLP analysis and clustering
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <Label htmlFor="num-clusters" className="text-sm font-medium text-gray-700">
            Number of Clusters
          </Label>
          <Input
            id="num-clusters"
            type="number"
            min="2"
            max="50"
            value={numClusters}
            onChange={(e) => onNumClustersChange(parseInt(e.target.value) || 10)}
            className="w-full border-gray-200 shadow-sm"
          />
          <p className="text-sm text-gray-400">
            How many groups to create (default: 10)
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="max-diff" className="text-sm font-medium text-gray-700">
            Max Member Difference
          </Label>
          <Input
            id="max-diff"
            type="number"
            min="1"
            max="100"
            value={maxDiff}
            onChange={(e) => onMaxDiffChange(parseInt(e.target.value) || 20)}
            className="w-full border-gray-200 shadow-sm"
          />
          <p className="text-sm text-gray-400">
            Maximum size difference between clusters (default: 20)
          </p>
        </div>
      </div>
    </div>
  );
}