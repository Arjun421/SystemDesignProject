/**
 * TEMPLATE METHOD PATTERN — Base Workflow
 *
 * Defines the fixed skeleton of an operation (validate → execute → postProcess).
 * Subclasses fill in the specific steps without changing the overall flow.
 */

export abstract class BaseWorkflow<TInput, TOutput> {
  // Template method — fixed order, cannot be overridden
  async run(input: TInput): Promise<TOutput> {
    await this.validate(input)
    const result = await this.execute(input)
    await this.postProcess(input, result)
    return result
  }

  // Steps subclasses must implement
  protected abstract validate(input: TInput): Promise<void>
  protected abstract execute(input: TInput): Promise<TOutput>

  // Optional hook — subclasses can override
  protected async postProcess(_input: TInput, _result: TOutput): Promise<void> {}
}
