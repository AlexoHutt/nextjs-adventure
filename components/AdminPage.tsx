'use client'
import '@xyflow/react/dist/style.css'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type EdgeChange,
  type OnNodeDrag,
  type NodeTypes,
} from '@xyflow/react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAdminStore } from '@/stores/admin'
import { useAdminGraph } from '@/hooks/useAdminGraph'
import AdminSceneNode from '@/components/AdminSceneNode'

const nodeTypes: NodeTypes = { sceneNode: AdminSceneNode as NodeTypes[string] }

export default function AdminPage() {
  const admin = useAdminStore()
  const { nodes: derivedNodes, edges: derivedEdges } = useAdminGraph()

  const [nodes, setNodes, onNodesChange] = useNodesState(derivedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(derivedEdges)

  // Track scene IDs to detect add/remove
  const sceneIds = useMemo(() => Object.keys(admin.scenes).sort().join('|'), [admin.scenes])
  const prevSceneIds = useRef('')

  useEffect(() => {
    if (!admin.loaded) return
    if (prevSceneIds.current !== sceneIds) {
      prevSceneIds.current = sceneIds
      setNodes(derivedNodes)
    }
  })

  // Sync edges whenever choices/connections change
  useEffect(() => {
    if (admin.loaded) setEdges(derivedEdges)
  }, [derivedEdges, admin.loaded, setEdges])

  // Initial load
  useEffect(() => {
    void admin.fetchScenes()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onConnect = useCallback((connection: Connection) => {
    const { source, target, sourceHandle } = connection
    if (!source || !target) return
    const sceneMatch = source.match(/^scene:(.+)$/)
    const handleMatch = sourceHandle?.match(/^choice:(\d+)$/)
    const targetMatch = target.match(/^scene:(.+)$/)
    if (sceneMatch?.[1] && handleMatch?.[1] && targetMatch?.[1]) {
      admin.updateChoiceTarget(sceneMatch[1], Number(handleMatch[1]), targetMatch[1])
    }
  }, [admin])

  const onEdgesChangeHandler = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes)
    for (const change of changes) {
      if (change.type === 'remove') {
        const match = change.id.match(/^e-scene:(.+):(\d+)-scene:/)
        if (match?.[1] && match?.[2]) {
          admin.disconnectChoice(match[1], Number(match[2]))
        }
      }
    }
  }, [admin, onEdgesChange])

  const onNodeDragStop: OnNodeDrag = useCallback((_evt, node) => {
    const match = node.id.match(/^scene:(.+)$/)
    if (!match?.[1]) return
    void admin.updatePosition(match[1], node.position.x, node.position.y)
  }, [admin])

  const [saving, setSaving] = useState(false)
  const save = async () => {
    setSaving(true)
    try {
      await fetch('/api/scenes', {
        method: 'PATCH',
        body: JSON.stringify(admin.scenes),
        headers: { 'Content-Type': 'application/json' },
      })
    } finally {
      setSaving(false)
    }
  }

  const sceneCount = Object.keys(admin.scenes).length
  const choiceCount = Object.values(admin.scenes).reduce((sum, s) => sum + s.choices.length, 0)

  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col">
      <header className="flex items-center gap-4 px-5 py-3 border-b border-gray-800 shrink-0">
        <Link href="/" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
          ← Back to Game
        </Link>
        <h1 className="text-lg font-bold">Scene Graph</h1>
        <span className="text-sm text-gray-500 ml-auto">
          {sceneCount} scenes · {choiceCount} choices
        </span>
        <button
          className="px-3 py-1 text-sm rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
          onClick={() => admin.addScene()}
        >
          + Add Scene
        </button>
        <button
          className="px-3 py-1 text-sm rounded-lg bg-amber-600 hover:bg-amber-500 font-medium transition-colors"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </header>

      <div className="flex-1 min-h-0">
        {admin.loaded ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChangeHandler}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            fitView
            className="w-full h-full"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Loading graph…
          </div>
        )}
      </div>
    </div>
  )
}
