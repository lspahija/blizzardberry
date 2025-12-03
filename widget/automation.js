/**
 * Widget Automation Integration
 * Uses Claude AI to analyze DOM and suggest actions, then executes them in the widget's browser
 */

import { captureDOMState, executeAction } from './domUtils.js';
import { getActionInference, runSkyvernTask } from './api.js';
import { state } from './state.js';

/**
 * Main automation function: Capture DOM, get AI inference, execute action
 * @param {string} userPrompt - User's instruction
 * @param {HTMLIFrameElement|null} iframe - Optional iframe to work with
 * @returns {Promise<Object>} Result of the operation
 */
export async function runAutomationStep(userPrompt, iframe = null) {
  try {
    console.log('Starting automation step:', userPrompt);

    // Step 1: Capture the current DOM state
    console.log('Step 1: Capturing DOM state...');
    const domState = captureDOMState(iframe);
    console.log(`Captured ${domState.elements.length} interactive elements`);

    // Step 2: Get action inference from Claude AI
    console.log('Step 2: Getting action inference from AI...');
    const inferenceResult = await getActionInference(domState, userPrompt);
    console.log('AI inference result:', inferenceResult);

    if (!inferenceResult.action) {
      throw new Error('No action returned from AI');
    }

    const action = inferenceResult.action;

    // Check if task is complete or error
    if (action.type === 'complete') {
      return {
        success: true,
        complete: true,
        prompt: userPrompt,
        message: action.message,
        reasoning: action.reasoning,
        timestamp: new Date().toISOString(),
      };
    }

    if (action.type === 'error') {
      return {
        success: false,
        error: action.message,
        reasoning: action.reasoning,
        prompt: userPrompt,
        timestamp: new Date().toISOString(),
      };
    }

    // Step 3: Execute the action
    console.log('Step 3: Executing action...');
    const executionResult = await executeAction(action, iframe);
    console.log('Action execution result:', executionResult);

    // Return complete result
    return {
      success: executionResult.success,
      complete: false,
      prompt: userPrompt,
      action,
      executionResult,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in automation step:', error);
    return {
      success: false,
      error: error.message,
      prompt: userPrompt,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Run a multi-step automation workflow
 * Executes multiple actions in sequence until task is complete
 * @param {string} taskPrompt - Overall task description
 * @param {number} maxSteps - Maximum number of steps to execute
 * @param {HTMLIFrameElement|null} iframe - Optional iframe
 * @returns {Promise<Object>} Result of the workflow
 */
export async function runMultiStepAutomation(
  taskPrompt,
  maxSteps = 10,
  iframe = null
) {
  const steps = [];
  let currentStep = 0;
  let isComplete = false;

  try {
    console.log('Starting multi-step automation:', taskPrompt);

    while (currentStep < maxSteps && !isComplete) {
      currentStep++;
      console.log(`\n--- Step ${currentStep}/${maxSteps} ---`);

      // Run one automation step
      const stepResult = await runAutomationStep(taskPrompt, iframe);

      // Record the step
      steps.push({
        step: currentStep,
        action: stepResult.action,
        result: stepResult.executionResult || stepResult,
        reasoning: stepResult.action?.reasoning,
        timestamp: new Date().toISOString(),
      });

      // Check if complete
      if (stepResult.complete) {
        console.log('Task completed!', stepResult.message);
        isComplete = true;
        break;
      }

      // If step failed, stop
      if (!stepResult.success) {
        console.error('Step failed, stopping workflow:', stepResult.error);
        break;
      }

      // Wait a bit for page to update
      await wait(1000);
    }

    return {
      success: isComplete || steps.every((s) => s.result.success),
      taskPrompt,
      totalSteps: steps.length,
      isComplete,
      steps,
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in multi-step automation:', error);
    return {
      success: false,
      error: error.message,
      taskPrompt,
      stepsCompleted: steps.length,
      steps,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Run a complete Skyvern task (for backend automation, not widget)
 * Use this when you want Skyvern to control the entire browser automation
 * NOTE: This is different - Skyvern spins up its own browser, not your widget
 * @param {string} url - URL to navigate to
 * @param {string} taskPrompt - Task description
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Task result
 */
export async function runBackendAutomation(url, taskPrompt, options = {}) {
  try {
    console.log('Starting backend automation (Skyvern):', { url, taskPrompt });

    // Run the task in Skyvern's browser (not the widget)
    const taskResult = await runSkyvernTask(url, taskPrompt, {
      maxSteps: options.maxSteps || 10,
      dataExtractionSchema: options.dataExtractionSchema,
      browserSessionId: options.browserSessionId,
    });

    console.log('Skyvern task created:', taskResult);

    return {
      success: true,
      taskId: taskResult.taskId,
      status: taskResult.status,
      result: taskResult,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error running backend automation:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Helper to wait
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Example usage functions for the widget automation
 */

// Example 1: Single action
export async function exampleSingleAction() {
  const result = await runAutomationStep(
    'Click the login button',
    null // No iframe, use main page
  );
  console.log('Single action result:', result);
  return result;
}

// Example 2: Multi-step workflow
export async function exampleMultiStep() {
  const result = await runMultiStepAutomation(
    'Fill out the contact form with name "John Doe" and email "john@example.com"',
    5 // Max 5 steps
  );
  console.log('Multi-step result:', result);
  return result;
}

// Example 3: Backend automation (Skyvern handles everything)
export async function exampleBackendAutomation() {
  const result = await runBackendAutomation(
    'https://example.com',
    'Find the pricing information and extract the cost of the premium plan'
  );
  console.log('Backend automation result:', result);
  return result;
}

// Export for use in other modules
export default {
  runAutomationStep,
  runMultiStepAutomation,
  runBackendAutomation,
  exampleSingleAction,
  exampleMultiStep,
  exampleBackendAutomation,
};
