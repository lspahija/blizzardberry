'use client';

import { useRef, useImperativeHandle, forwardRef } from 'react';
import {
  Tldraw,
  Editor,
  TLShapeId,
  createShapeId,
  TLGeoShape,
  TLDrawShape,
  TLTextShape,
  TLArrowShape,
  TLLineShape,
  TLFrameShape,
  TLGroupShape,
  TLImageShape,
  TLVideoShape,
  TLBookmarkShape,
  TLEmbedShape,
  TLNoteShape,
  TLHighlightShape,
  Vec,
  TLShape,
} from 'tldraw';
import 'tldraw/tldraw.css';

// Types for shape data that LLM will receive
export interface ShapeData {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  description: string;
  props: any;
}

// Types for creating shapes
export interface CreateShapeOptions {
  type: 'geo' | 'text' | 'draw' | 'arrow' | 'line' | 'note' | 'frame';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  geo?:
    | 'rectangle'
    | 'ellipse'
    | 'triangle'
    | 'diamond'
    | 'pentagon'
    | 'hexagon'
    | 'octagon'
    | 'star'
    | 'rhombus'
    | 'cloud'
    | 'oval';
  color?:
    | 'black'
    | 'grey'
    | 'light-violet'
    | 'violet'
    | 'blue'
    | 'light-blue'
    | 'yellow'
    | 'orange'
    | 'green'
    | 'light-green'
    | 'light-red'
    | 'red';
  fill?: 'none' | 'solid' | 'semi' | 'pattern';
  size?: 's' | 'm' | 'l' | 'xl';
}

// API interface that the LLM will use
export interface TldrawAPI {
  getShapes: () => ShapeData[];
  createShape: (options: CreateShapeOptions) => string | null;
  deleteShape: (shapeId: string) => boolean;
  deleteAllShapes: () => void;
  getCanvasInfo: () => { width: number; height: number; zoom: number };
}

const TldrawWithAPI = forwardRef<TldrawAPI>((props, ref) => {
  const editorRef = useRef<Editor | null>(null);

  // Helper function to get shape description
  const getShapeDescription = (shape: TLShape): string => {
    switch (shape.type) {
      case 'geo':
        const geoShape = shape as TLGeoShape;
        return `${geoShape.props.geo} shape with ${geoShape.props.fill} fill and ${geoShape.props.color} color`;
      case 'text':
        const textShape = shape as TLTextShape;
        return `Text: "${textShape.props.text}"`;
      case 'draw':
        return 'Freehand drawing';
      case 'arrow':
        return 'Arrow';
      case 'line':
        return 'Line';
      case 'note':
        const noteShape = shape as TLNoteShape;
        return `Note: "${noteShape.props.text}"`;
      case 'frame':
        const frameShape = shape as TLFrameShape;
        return `Frame: "${frameShape.props.name || 'Unnamed'}"`;
      default:
        return `${shape.type} shape`;
    }
  };

  // Expose API methods
  useImperativeHandle(
    ref,
    () => ({
      getShapes: () => {
        if (!editorRef.current) return [];

        const editor = editorRef.current;
        const shapes = editor.getCurrentPageShapes();

        return shapes.map((shape) => {
          const bounds = editor.getShapeGeometry(shape).bounds;
          const pageTransform = editor.getShapePageTransform(shape);

          return {
            id: shape.id,
            type: shape.type,
            x: pageTransform.point().x,
            y: pageTransform.point().y,
            width: bounds.width,
            height: bounds.height,
            rotation: pageTransform.rotation(),
            description: getShapeDescription(shape),
          };
        });
      },

      createShape: (options: CreateShapeOptions) => {
        if (!editorRef.current) return null;

        const editor = editorRef.current;
        const shapeId = createShapeId();

        let shapeData: any = {
          id: shapeId,
          type: options.type,
          x: options.x,
          y: options.y,
        };

        // Set default dimensions if not provided
        const defaultWidth = options.width || 100;
        const defaultHeight = options.height || 100;

        switch (options.type) {
          case 'geo':
            shapeData = {
              ...shapeData,
              props: {
                geo: options.geo || 'rectangle',
                w: defaultWidth,
                h: defaultHeight,
                color: options.color || 'black',
                fill: options.fill || 'none',
                size: options.size || 'm',
              },
            };
            break;
          case 'text':
            shapeData = {
              ...shapeData,
              props: {
                text: options.text || 'New text',
                color: options.color || 'black',
                size: options.size || 'm',
                autoSize: true,
              },
            };
            break;
          case 'note':
            shapeData = {
              ...shapeData,
              props: {
                text: options.text || 'New note',
                color: options.color || 'yellow',
                size: options.size || 'm',
              },
            };
            break;
          case 'frame':
            shapeData = {
              ...shapeData,
              props: {
                w: defaultWidth,
                h: defaultHeight,
                name: options.text || 'Frame',
              },
            };
            break;
          case 'draw':
            // For draw shapes, we'll create a simple line
            const points = [
              { x: 0, y: 0, z: 0.5 },
              { x: defaultWidth, y: defaultHeight, z: 0.5 },
            ];
            shapeData = {
              ...shapeData,
              props: {
                segments: [
                  {
                    type: 'free',
                    points: points,
                  },
                ],
                color: options.color || 'black',
                size: options.size || 'm',
                isComplete: true,
                isClosed: false,
              },
            };
            break;
          case 'arrow':
          case 'line':
            // For arrows and lines, create start and end points
            shapeData = {
              ...shapeData,
              props: {
                start: {
                  type: 'point',
                  x: 0,
                  y: 0,
                },
                end: {
                  type: 'point',
                  x: defaultWidth,
                  y: defaultHeight,
                },
                color: options.color || 'black',
                size: options.size || 'm',
              },
            };
            break;
        }

        try {
          editor.createShape(shapeData);
          return shapeId;
        } catch (error) {
          console.error('Error creating shape:', error);
          return null;
        }
      },

      deleteShape: (shapeId: string) => {
        if (!editorRef.current) return false;

        try {
          const editor = editorRef.current;
          const shape = editor.getShape(shapeId as TLShapeId);
          if (shape) {
            editor.deleteShape(shapeId as TLShapeId);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error deleting shape:', error);
          return false;
        }
      },

      deleteAllShapes: () => {
        if (!editorRef.current) return;

        const editor = editorRef.current;
        const allShapes = editor.getCurrentPageShapes();
        const shapeIds = allShapes.map((shape) => shape.id);
        editor.deleteShapes(shapeIds);
      },

      getCanvasInfo: () => {
        if (!editorRef.current) return { width: 0, height: 0, zoom: 1 };

        const editor = editorRef.current;
        const viewport = editor.getViewportScreenBounds();

        return {
          width: viewport.width,
          height: viewport.height,
          zoom: editor.getZoomLevel(),
        };
      },
    }),
    []
  );

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        onMount={(editor) => {
          editorRef.current = editor;
          // You can add any initial setup here
        }}
      />
    </div>
  );
});

TldrawWithAPI.displayName = 'TldrawWithAPI';

// Example wrapper component showing how to use the API
export default function ExampleWithLLMIntegration() {
  const tldrawRef = useRef<TldrawAPI>(null);

  // Example functions that an LLM could call
  const handleGetShapes = () => {
    if (tldrawRef.current) {
      const shapes = tldrawRef.current.getShapes();
      console.log('Current shapes:', shapes);
      return shapes;
    }
  };

  const handleCreateRectangle = () => {
    if (tldrawRef.current) {
      const shapeId = tldrawRef.current.createShape({
        type: 'geo',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        geo: 'rectangle',
        color: 'blue',
        fill: 'solid',
      });
      console.log('Created shape with ID:', shapeId);
    }
  };

  const handleCreateText = () => {
    if (tldrawRef.current) {
      const shapeId = tldrawRef.current.createShape({
        type: 'text',
        x: 300,
        y: 200,
        text: 'Hello from LLM!',
        color: 'red',
        size: 'l',
      });
      console.log('Created text with ID:', shapeId);
    }
  };

  const handleDeleteAll = () => {
    if (tldrawRef.current) {
      tldrawRef.current.deleteAllShapes();
      console.log('Deleted all shapes');
    }
  };

  // In a real implementation, these functions would be exposed to your LLM
  // through your backend API or integration layer

  return (
    <>
      <TldrawWithAPI ref={tldrawRef} />

      {/* Debug controls - remove these in production */}
      <div
        style={{
          position: 'fixed',
          top: 10,
          right: 10,
          background: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <button onClick={handleGetShapes}>Get Shapes (console)</button>
        <button onClick={handleCreateRectangle}>Create Rectangle</button>
        <button onClick={handleCreateText}>Create Text</button>
        <button onClick={handleDeleteAll}>Delete All</button>
      </div>
    </>
  );
}
