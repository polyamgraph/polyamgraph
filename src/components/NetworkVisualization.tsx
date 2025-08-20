import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Connection as FlowConnection,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PersonNode } from './PersonNode';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

const nodeTypes = {
  person: PersonNode,
};

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  privacy_mode: 'public' | 'friends' | 'private';
  show_in_network: boolean;
}

interface UserConnection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  relationship_type: 'partner' | 'friend' | 'meta' | 'other';
  is_visible: boolean;
  notes: string | null;
  requester_profile?: Profile;
  addressee_profile?: Profile;
}

interface NetworkVisualizationProps {
  userProfile: Profile | null;
  connections: UserConnection[];
  profiles: Profile[];
  onRefresh: () => void;
}

export function NetworkVisualization({ 
  userProfile, 
  connections, 
  profiles,
  onRefresh 
}: NetworkVisualizationProps) {
  
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!userProfile) return { nodes: [], edges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodePositions = new Map<string, { x: number; y: number }>();

    // Add current user at center
    const centerX = 400;
    const centerY = 300;
    
    nodes.push({
      id: userProfile.user_id,
      type: 'person',
      position: { x: centerX, y: centerY },
      data: {
        profile: userProfile,
        isCurrentUser: true,
      },
    });
    nodePositions.set(userProfile.user_id, { x: centerX, y: centerY });

    // Add connected users in a circle around the center
    const acceptedConnections = connections.filter(c => c.status === 'accepted' && c.is_visible);
    const radius = 200;
    const angleStep = (2 * Math.PI) / Math.max(acceptedConnections.length, 1);

    acceptedConnections.forEach((connection, index) => {
      const otherProfile = connection.requester_id === userProfile.user_id 
        ? connection.addressee_profile 
        : connection.requester_profile;
      
      if (!otherProfile) return;

      const angle = index * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      if (!nodePositions.has(otherProfile.user_id)) {
        nodes.push({
          id: otherProfile.user_id,
          type: 'person',
          position: { x, y },
          data: {
            profile: otherProfile,
            isCurrentUser: false,
          },
        });
        nodePositions.set(otherProfile.user_id, { x, y });
      }

      // Add edge for the connection
      edges.push({
        id: connection.id,
        source: connection.requester_id,
        target: connection.addressee_id,
        type: 'smoothstep',
        style: {
          stroke: getConnectionColor(connection.relationship_type),
          strokeWidth: 2,
        },
        label: connection.relationship_type,
        labelStyle: {
          fontSize: 10,
          fontWeight: 600,
        },
      });
    });

    // Add connections between non-current-user nodes (metamour connections)
    acceptedConnections.forEach(connection1 => {
      acceptedConnections.forEach(connection2 => {
        if (connection1.id === connection2.id) return;
        
        const profile1 = connection1.requester_id === userProfile.user_id 
          ? connection1.addressee_profile 
          : connection1.requester_profile;
        const profile2 = connection2.requester_id === userProfile.user_id 
          ? connection2.addressee_profile 
          : connection2.requester_profile;
        
        if (!profile1 || !profile2) return;

        // Check if these two profiles are connected to each other
        const metaConnection = connections.find(c => 
          (c.requester_id === profile1.user_id && c.addressee_id === profile2.user_id) ||
          (c.requester_id === profile2.user_id && c.addressee_id === profile1.user_id)
        );

        if (metaConnection && metaConnection.status === 'accepted' && metaConnection.is_visible) {
          const edgeId = `meta-${profile1.user_id}-${profile2.user_id}`;
          if (!edges.find(e => e.id === edgeId)) {
            edges.push({
              id: edgeId,
              source: profile1.user_id,
              target: profile2.user_id,
              type: 'smoothstep',
              style: {
                stroke: getConnectionColor(metaConnection.relationship_type),
                strokeWidth: 1,
                strokeDasharray: '5,5',
              },
              label: metaConnection.relationship_type,
              labelStyle: {
                fontSize: 8,
                fontWeight: 400,
              },
            });
          }
        }
      });
    });

    return { nodes, edges };
  }, [userProfile, connections, profiles]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: FlowConnection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  function getConnectionColor(type: string): string {
    switch (type) {
      case 'partner': return 'hsl(var(--primary))';
      case 'friend': return 'hsl(var(--secondary))';
      case 'meta': return 'hsl(var(--accent))';
      default: return 'hsl(var(--muted-foreground))';
    }
  }

  return (
    <div className="h-[calc(100vh-73px)] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-background"
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            return node.data.isCurrentUser ? 'hsl(var(--primary))' : 'hsl(var(--secondary))';
          }}
          className="bg-card border border-border"
        />
        <Panel position="top-right">
          <Button
            onClick={onRefresh}
            size="sm"
            variant="outline"
            className="bg-card"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}