import {Bot} from 'mineflayer';
import {ISkillServiceParams, ISkillParams} from '../../types/skillType';
import {validateSkillParams} from '../index';
import {useFurnace} from '../library/useFurnace';

/**
 * Cook specified item(s) in Minecraft.
 *
 * @param {Bot} bot - The Mineflayer bot instance. Assume the bot is already spawned in the world.
 * @param {object} params
 * @param {string} params.itemName.stringValue - The name of the item to cook.
 * @param {string} params.fuelName.stringValue - The name of the fuel used for cooking. Must be a resource from your inventory.
 * @param {number} params.count.numberValue - The minimum number of items to craft. Defaults to 1, maximum is 64
 * @param {object} serviceParams - additional parameters for the skill function.
 *
 * @return {Promise<boolean>} - Returns a promise that resolves to true if cooking is successful, otherwise false.
 */

export const cookItem = async (
  bot: Bot,
  params: ISkillParams,
  serviceParams: ISkillServiceParams,
): Promise<boolean> => {
  const skillName = 'cookItem';
  const requiredParams = ['itemName', 'fuelName'];
  const isParamsValid = validateSkillParams(
    params,
    requiredParams,
    skillName,
  );
  if (!isParamsValid) {
    serviceParams.cancelExecution?.();
    bot.emit(
      'alteraBotEndObservation',
      `Mistake: You didn't provide all of the required parameters ${requiredParams.join(', ')} for the ${skillName} skill.`,
    );
    return false;
  }
  const defaultParams = {
    count: 1,
  };
  const useCount: number = Math.min(defaultParams.count, 4);

  return await useFurnace(bot, {
    itemName: params.itemName.stringValue,
    fuelName: params.fuelName.stringValue,
    count: useCount,
    action: 'cook',
    signal: serviceParams.signal,
    getStatsData: serviceParams.getStatsData,
    setStatsData: serviceParams.setStatsData,
  });
};
