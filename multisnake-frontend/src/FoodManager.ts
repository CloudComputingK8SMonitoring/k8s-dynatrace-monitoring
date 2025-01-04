import FoodEntity from "./entities/FoodEntity";
import {FOOD_AMOUNT} from "./game.config";

/**
 * Manages the list of currently spawned food.
 */
class FoodManager {
  private readonly food: FoodEntity[] = [];

  /**
   * Spawns food entities.
   * The amount of food is determined in game.config.ts: FOOD_AMOUNT
   */
  public spawnFood() {
    for (let i = 0; i < FOOD_AMOUNT; i++)
      this.food.push(new FoodEntity());
  }

  public getFood() {
    return this.food;
  }
}

export default new FoodManager();
