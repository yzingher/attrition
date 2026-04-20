'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Application, Graphics, Text, TextStyle, Container } from 'pixi.js'
import { MapDef, MapNode } from '@/game/data/maps'

interface GameCanvasProps {
  map: MapDef
  p1Color: string
  p2Color: string
}

const NODE_COLORS: Record<string, number> = {
  'hq': 0xffffff,
  'raw': 0x8b6914,
  'component': 0x6c3483,
  'assembly': 0x1a5276,
  'energy': 0xf39c12,
  'human-capital': 0x27ae60,
}

const NODE_ICONS: Record<string, string> = {
  'hq': '◆',
  'raw': '⬡',
  'component': '◈',
  'assembly': '▣',
  'energy': '⚡',
  'human-capital': '◉',
}

export function GameCanvas({ map, p1Color, p2Color }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)

  const drawMap = useCallback((app: Application) => {
    const w = app.screen.width
    const h = app.screen.height

    // Clear previous
    app.stage.removeChildren()

    // Background
    const bg = new Graphics()
    bg.rect(0, 0, w, h)
    bg.fill(parseInt(map.backgroundColor.replace('#', ''), 16))
    app.stage.addChild(bg)

    // Grid
    const grid = new Graphics()
    const gridColorNum = parseInt(map.gridColor.replace('#', ''), 16)
    const gridSpacing = 40
    for (let x = 0; x < w; x += gridSpacing) {
      grid.moveTo(x, 0)
      grid.lineTo(x, h)
      grid.stroke({ color: gridColorNum, width: 0.5, alpha: 0.4 })
    }
    for (let y = 0; y < h; y += gridSpacing) {
      grid.moveTo(0, y)
      grid.lineTo(w, y)
      grid.stroke({ color: gridColorNum, width: 0.5, alpha: 0.4 })
    }
    app.stage.addChild(grid)

    // Landmasses
    const landContainer = new Container()
    for (const land of map.landmasses) {
      const g = new Graphics()
      const colorNum = parseInt(land.color.replace('#', ''), 16)

      const pts = land.points.map(([px, py]) => ({ x: px * w, y: py * h }))
      if (pts.length > 0) {
        g.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) {
          g.lineTo(pts[i].x, pts[i].y)
        }
        g.closePath()
        g.fill({ color: colorNum, alpha: 0.8 })
        g.stroke({ color: colorNum, width: 1.5, alpha: 0.6 })
      }

      landContainer.addChild(g)

      // Land label
      if (land.label) {
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length
        const label = new Text({
          text: land.label.toUpperCase(),
          style: new TextStyle({
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            fill: 0x2a4030,
            letterSpacing: 2,
          }),
        })
        label.anchor.set(0.5)
        label.position.set(cx, cy)
        landContainer.addChild(label)
      }
    }
    app.stage.addChild(landContainer)

    // Sea routes (dashed lines)
    const routeContainer = new Container()
    for (const route of map.routes) {
      const g = new Graphics()
      const fromX = route.from[0] * w
      const fromY = route.from[1] * h
      const toX = route.to[0] * w
      const toY = route.to[1] * h

      const color = route.type === 'sea' ? 0x0a3050 : 0x1a1a30
      const dashLen = route.type === 'sea' ? 8 : 12
      const gapLen = route.type === 'sea' ? 6 : 8

      // Draw dashed line
      const dx = toX - fromX
      const dy = toY - fromY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const ux = dx / dist
      const uy = dy / dist

      let d = 0
      while (d < dist) {
        const startX = fromX + ux * d
        const startY = fromY + uy * d
        const endD = Math.min(d + dashLen, dist)
        const endX = fromX + ux * endD
        const endY = fromY + uy * endD
        g.moveTo(startX, startY)
        g.lineTo(endX, endY)
        g.stroke({ color, width: 1, alpha: 0.5 })
        d += dashLen + gapLen
      }
      routeContainer.addChild(g)
    }
    app.stage.addChild(routeContainer)

    // Strait label (center of map)
    const straitLabel = new Text({
      text: map.name.toUpperCase(),
      style: new TextStyle({
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        fill: 0x1a3040,
        letterSpacing: 4,
      }),
    })
    straitLabel.anchor.set(0.5)
    straitLabel.position.set(w * 0.47, h * 0.08)
    app.stage.addChild(straitLabel)

    // Production nodes
    const nodeContainer = new Container()
    const allNodes = [
      ...map.startingNodes.player1,
      ...map.startingNodes.player2,
    ]

    for (const node of allNodes) {
      drawNode(nodeContainer, node, w, h, node.player === 1 ? p1Color : p2Color)
    }
    app.stage.addChild(nodeContainer)

    // Player territory indicators
    const p1Indicator = new Text({
      text: '◀ P1',
      style: new TextStyle({
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        fill: parseInt(p1Color.replace('#', ''), 16),
        letterSpacing: 1,
      }),
    })
    p1Indicator.position.set(10, h - 20)
    app.stage.addChild(p1Indicator)

    const p2Indicator = new Text({
      text: 'P2 ▶',
      style: new TextStyle({
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 10,
        fill: parseInt(p2Color.replace('#', ''), 16),
        letterSpacing: 1,
      }),
    })
    p2Indicator.anchor.set(1, 0)
    p2Indicator.position.set(w - 10, h - 20)
    app.stage.addChild(p2Indicator)
  }, [map, p1Color, p2Color])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    let destroyed = false

    const initApp = async () => {
      const app = new Application()
      await app.init({
        resizeTo: container,
        backgroundColor: 0x060a10,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })

      if (destroyed) {
        app.destroy(true)
        return
      }

      container.appendChild(app.canvas as HTMLCanvasElement)
      appRef.current = app
      drawMap(app)

      // Handle resize
      const resizeObserver = new ResizeObserver(() => {
        if (appRef.current) {
          appRef.current.resize()
          drawMap(appRef.current)
        }
      })
      resizeObserver.observe(container)

      return () => {
        resizeObserver.disconnect()
      }
    }

    initApp()

    return () => {
      destroyed = true
      if (appRef.current) {
        appRef.current.destroy(true)
        appRef.current = null
      }
    }
  }, [drawMap])

  return <div ref={containerRef} className="w-full h-full" />
}

function drawNode(container: Container, node: MapNode, w: number, h: number, playerColor: string) {
  const x = node.x * w
  const y = node.y * h
  const nodeColor = NODE_COLORS[node.type] || 0xffffff
  const playerColorNum = parseInt(playerColor.replace('#', ''), 16)

  // Outer ring (player color)
  const ring = new Graphics()
  ring.circle(x, y, 14)
  ring.stroke({ color: playerColorNum, width: 1.5, alpha: 0.6 })
  container.addChild(ring)

  // Inner fill
  const inner = new Graphics()
  inner.circle(x, y, 10)
  inner.fill({ color: nodeColor, alpha: 0.15 })
  inner.stroke({ color: nodeColor, width: 1, alpha: 0.8 })
  container.addChild(inner)

  // Icon
  const icon = new Text({
    text: NODE_ICONS[node.type] || '●',
    style: new TextStyle({
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10,
      fill: nodeColor,
    }),
  })
  icon.anchor.set(0.5)
  icon.position.set(x, y)
  container.addChild(icon)

  // Label
  const label = new Text({
    text: node.label,
    style: new TextStyle({
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 8,
      fill: 0x4a6070,
    }),
  })
  label.anchor.set(0.5, 0)
  label.position.set(x, y + 18)
  container.addChild(label)
}
