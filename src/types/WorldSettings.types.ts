export type WorldSettingOptionType = 'num' | 'num_10' | 'switch' | 'options' | 'text';

export type WorldSettingOption = {
  type: WorldSettingOptionType;
  range?: (number | string)[];
  default?: number | string | boolean;
  noTranslate?: boolean;
};

export type WorldSettingsOptions = Record<string, WorldSettingOption>;

export type WorldSettingsValues = Record<string, string | number | boolean>;
