export interface IMethodGetAppDataDirPathOptions
  extends IMethodCreateIfNotExistsOption {
  nestedDirs?: string[];
}

export interface IMethodCreateIfNotExistsOption {
  createIfNotExists?: boolean;
}
