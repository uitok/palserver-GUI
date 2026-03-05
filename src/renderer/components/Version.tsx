import useLatestVersion from '../hooks/firebase/useLatestVersion';
import { ENV, PLATFORM, SERVER_URL, VERSION } from '../../constant/app';
import useTranslation from '../hooks/translation/useTranslation';
import formatLocale from '../utils/formatLocale';
import versionToValue from '../utils/versionToValue';
import Link from './Link';

export default function Version() {
  const { t, language } = useTranslation();

  const { version: latestVersion, versionValue: latestVersionValue } =
    useLatestVersion();
  const currentVersionValue = versionToValue(VERSION);

  return (
    <div className="absolute bottom-3 text-xs w-[100%] flex items-end">
      <div>
        <div>
          {latestVersionValue > currentVersionValue ? (
            <Link
              appearance="dark"
              href={`https://github.com/Dalufishe/palserver-GUI/releases/tag/${latestVersion}`}
            >
              {formatLocale(t('NewUpdate'), [latestVersion])}
            </Link>
          ) : (
            <Link
              appearance="dark"
              href={`https://github.com/Dalufishe/palserver-GUI/releases/tag/${VERSION}`}
            >
              {t('UpdateLog')}
            </Link>
          )}
          <Link
            appearance="dark"
            href={`${SERVER_URL}/data/links/${language}/FAQS`}
          >
            {t('FAQ')}
          </Link>
        </div>
        <div>
          <span className="font-mono">
            {ENV} - {VERSION} ({PLATFORM}){' '}
          </span>
          , made by{' '}
          <span
            className="text-xs underline cursor-pointer"
            style={{ color: 'white' }}
            onClick={() => {
              window.electron.openLink('https://github.com/Dalufishe');
            }}
          >
            Dalufishe
          </span>
        </div>
      </div>
    </div>
  );
}
