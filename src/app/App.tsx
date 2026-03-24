import { useState } from 'react';
import Papa from 'papaparse';
import { FileUpload } from './components/FileUpload';
import { ClusteringConfig } from './components/ClusteringConfig';
import { ClusterResults } from './components/ClusterResults';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface ClusterData {
  cluster_id: number;
  members: Array<{
    id: number;
    data: Record<string, any>;
  }>;
  size: number;
  label?: string;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [numClusters, setNumClusters] = useState<number>(10);
  const [maxDiff, setMaxDiff] = useState<number>(20);
  const [apiEndpoint, setApiEndpoint] = useState<string>(
    import.meta.env.VITE_API_ENDPOINT || 'http://localhost:8000'
  );
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clusters, setClusters] = useState<ClusterData[] | null>(null);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [resultCsv, setResultCsv] = useState<string | null>(null);
  const [selectedClusterFromSearch, setSelectedClusterFromSearch] = useState<number | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setClusters(null);
    
    // Parse CSV to extract columns
    Papa.parse(file, {
      header: true,
      preview: 1,
      complete: (results) => {
        if (results.data.length > 0) {
          const cols = Object.keys(results.data[0]);
          setColumns(cols);
          setSelectedColumn('');
        }
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      },
    });

    // Parse full CSV data
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setCsvData(results.data);
        setTotalRecords(results.data.length);
      },
    });
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setColumns([]);
    setSelectedColumn('');
    setCsvData([]);
    setClusters(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !selectedColumn) {
      setError('Please select a file and column');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('text_column', selectedColumn);
      formData.append('num_clusters', numClusters.toString());
      formData.append('max_diff', maxDiff.toString());

      // Call the FastAPI endpoint
      const response = await fetch(`${apiEndpoint}/api/v1/cluster`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'API request failed');
      }

      // Get the CSV response
      const csvText = await response.text();
      setResultCsv(csvText);

      // Parse the returned CSV to extract cluster data
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const parsedData = results.data as any[];
          
          // Group by assigned_cluster
          const clusterMap = new Map<number, any[]>();
          
          parsedData.forEach((row, index) => {
            if (row && row.assigned_cluster !== undefined && row.assigned_cluster !== '') {
              const clusterId = parseInt(row.assigned_cluster);
              if (!clusterMap.has(clusterId)) {
                clusterMap.set(clusterId, []);
              }
              clusterMap.get(clusterId)?.push({
                id: index,
                data: row,
              });
            }
          });

          // Convert to ClusterData array
          const clustersArray: ClusterData[] = Array.from(clusterMap.entries()).map(
            ([cluster_id, members]) => ({
              cluster_id,
              members,
              size: members.length,
            })
          );

          // Sort by cluster_id
          clustersArray.sort((a, b) => a.cluster_id - b.cluster_id);
          
          setClusters(clustersArray);
          
          // Calculate total records in clusters
          const totalClusteredRecords = clustersArray.reduce(
            (sum, cluster) => sum + cluster.size,
            0
          );
          
          toast.success(`Clustering completed! ${clustersArray.length} clusters created with ${totalClusteredRecords} records.`);
        },
        error: (err) => {
          throw new Error(`Failed to parse result CSV: ${err.message}`);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process clustering');
      toast.error('Clustering failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster />
      
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {/* Header */}
        <div className="mb-20">
          <h1 className="text-6xl font-light text-gray-900 mb-3 tracking-tight">
            Groupify
          </h1>
          <p className="text-lg text-gray-500 font-light">
            AI-powered clustering for your data
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* Upload Section */}
          <div>
            <h2 className="text-sm font-medium text-gray-900 mb-6 uppercase tracking-wide">
              Upload CSV File
            </h2>
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClear={handleClearFile}
            />
          </div>

          {/* Column Selection */}
          {columns.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-6 uppercase tracking-wide">
                Configure Clustering
              </h2>
              <ClusteringConfig
                columns={columns}
                selectedColumn={selectedColumn}
                onColumnSelect={setSelectedColumn}
                numClusters={numClusters}
                onNumClustersChange={setNumClusters}
                maxDiff={maxDiff}
                onMaxDiffChange={setMaxDiff}
              />
              
              <div className="mt-8">
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedColumn || isProcessing}
                  className="px-8 py-6 text-base"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Run Clustering
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="shadow-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {clusters && (
            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-6 uppercase tracking-wide">
                Results
              </h2>
              <ClusterResults
                clusters={clusters}
                totalRecords={totalRecords}
                selectedClusterFromSearch={selectedClusterFromSearch}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;