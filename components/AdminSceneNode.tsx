'use client'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useAdminStore } from '@/stores/admin'
import type { Choice } from '@/stores/game'

interface SceneNodeData {
  id: string
  text: string
}

function ChoiceRow({ choice, idx, sceneId }: { choice: Choice; idx: number; sceneId: string }) {
  const updateChoiceText = useAdminStore((s) => s.updateChoiceText)
  const removeChoice = useAdminStore((s) => s.removeChoice)
  const [text, setText] = useState(choice.text)

  useEffect(() => { setText(choice.text) }, [choice.text])

  return (
    <div className="relative flex items-center gap-1 bg-amber-900 border border-amber-700 rounded px-2 py-1">
      <input
        value={text}
        className="bg-transparent text-amber-100 text-xs w-full outline-none focus:text-white"
        onChange={(e) => setText(e.target.value)}
        onBlur={() => updateChoiceText(sceneId, idx, text)}
        onMouseDown={(e) => e.stopPropagation()}
      />
      <button
        className="text-amber-500 hover:text-red-400 text-xs shrink-0 transition-colors nodrag"
        title="Delete choice"
        onClick={(e) => { e.stopPropagation(); removeChoice(sceneId, idx) }}
        onMouseDown={(e) => e.stopPropagation()}
      >×</button>
      <Handle
        id={`choice:${idx}`}
        type="source"
        position={Position.Right}
        style={{ right: -8 }}
      />
    </div>
  )
}

function AdminSceneNode({ data }: { data: SceneNodeData }) {
  const id = data.id
  const scene = useAdminStore((s) => s.scenes[id])
  const updateSceneTitle = useAdminStore((s) => s.updateSceneTitle)
  const updateSceneText = useAdminStore((s) => s.updateSceneText)
  const addChoice = useAdminStore((s) => s.addChoice)
  const deleteScene = useAdminStore((s) => s.deleteScene)

  const choices = scene?.choices ?? []
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [localText, setLocalText] = useState(scene?.text ?? '')

  useEffect(() => {
    if (scene?.text !== undefined) setLocalText(scene.text)
  }, [scene?.text])

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '0'
    el.style.height = el.scrollHeight + 'px'
  }, [])

  useEffect(() => { autoResize() }, [localText, autoResize])

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden flex flex-col shadow-lg min-w-[220px]">
      <div className="drag-handle flex items-center px-2 py-1 bg-gray-700 hover:bg-gray-600 cursor-grab active:cursor-grabbing transition-colors">
        <span className="text-gray-400 text-xs tracking-widest select-none flex-1 text-center">⠿</span>
        <button
          className="text-gray-500 hover:text-red-400 text-xs transition-colors nodrag"
          title="Delete scene"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); void deleteScene(id) }}
        >✕</button>
      </div>

      <div className="p-2 flex flex-col gap-1">
        <input
          defaultValue={scene?.title ?? id}
          key={scene?.title ?? id}
          className="bg-transparent text-white text-sm font-semibold w-full outline-none border-b border-gray-700 pb-1 focus:border-amber-500 placeholder-gray-500"
          placeholder="Scene title"
          onBlur={(e) => updateSceneTitle(id, e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
        />
        <span className="text-gray-600 font-mono text-[10px] select-all">{id}</span>
        <textarea
          ref={textareaRef}
          value={localText}
          className="bg-transparent text-gray-200 text-xs w-full outline-none resize-none focus:text-white overflow-hidden"
          onChange={(e) => setLocalText(e.target.value)}
          onInput={autoResize}
          onBlur={() => updateSceneText(id, localText)}
          onMouseDown={(e) => e.stopPropagation()}
        />

        <div className="flex flex-col gap-1 mt-1">
          {choices.map((choice, idx) => (
            <ChoiceRow key={idx} choice={choice} idx={idx} sceneId={id} />
          ))}
        </div>

        <button
          className="mt-1 text-xs text-gray-500 hover:text-amber-400 transition-colors text-left nodrag"
          onClick={(e) => { e.stopPropagation(); addChoice(id) }}
          onMouseDown={(e) => e.stopPropagation()}
        >+ Add Choice</button>
      </div>

      <Handle type="target" position={Position.Left} />
    </div>
  )
}

export default memo(AdminSceneNode)
