import { Box, Button, Checkbox, Flex, Text, TextField } from '@radix-ui/themes';
import { usePlaygroundSettingsStore } from '~/store/use-playground-settings';
import { cn } from '~/utils/classnames';

export function SettingsTab() {
  // Get state and actions from the Zustand store
  const {
    output,
    include,
    ignore,
    fileSummary,
    directoryStructure,
    outputShowLineNumbers,
    parsableStyle,
    compress,
    removeComments,
    removeEmptyLines,
    setSettings,
  } = usePlaygroundSettingsStore();

  type OutputFormat = 'xml' | 'markdown' | 'plain' | undefined;

  const handleFormatChange = (newFormat: OutputFormat) => {
    setSettings({ output: newFormat });
  };

  const handleCheckboxChange = (key: string, checked: boolean) => {
    setSettings({ [key]: checked });
  };

  return (
    <Box className={cn('py-6 rounded-lg')}>
      <Flex direction={'column'} gap="8">
        <Flex direction="column" gap="6" className="flex-1">
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium" className="text-[var(--gray-11)]">
              Output Format
            </Text>
            <Flex gap="2">
              <Button
                variant={output === 'xml' ? 'solid' : 'outline'}
                color="tomato"
                size="2"
                onClick={() => handleFormatChange('xml')}
              >
                XML
              </Button>
              <Button
                variant={output === 'markdown' ? 'solid' : 'outline'}
                color="tomato"
                size="2"
                onClick={() => handleFormatChange('markdown')}
              >
                Markdown
              </Button>
              <Button
                variant={output === 'plain' ? 'solid' : 'outline'}
                color="tomato"
                size="2"
                onClick={() => handleFormatChange('plain')}
              >
                Plain
              </Button>
            </Flex>
          </Flex>

          <label>
            <Text
              size="2"
              weight="medium"
              as="div"
              mb="1"
              className="text-[var(--gray-11)]"
            >
              Include Patterns (using{' '}
              <span
                className="text-[var(--tomato-9)] cursor-pointer hover:underline"
                aria-label="Learn more about glob patterns"
              >
                glob patterns
              </span>
              )
            </Text>
            <TextField.Root
              id="include-patterns"
              type="text"
              placeholder="Comma-separated patterns to include. e.g., src/**/*.ts"
              size="2"
              value={include || ''}
              onChange={(e) => setSettings({ include: e.target.value })}
            />
          </label>

          <label>
            <Text
              size="2"
              weight="medium"
              as="div"
              mb="1"
              className="text-[var(--gray-11)]"
            >
              Ignore Patterns
            </Text>
            <TextField.Root
              id="ignore-patterns"
              type="text"
              placeholder="Comma-separated patterns to ignore. e.g., **/*.test.ts,README.md"
              size="2"
              value={ignore || ''}
              onChange={(e) => setSettings({ ignore: e.target.value })}
            />
          </label>
        </Flex>

        <Flex direction="column" gap="4" className="md:basis-1/3">
          <Text size="2" weight="medium" className="text-[var(--gray-11)]">
            Output Format Options
          </Text>
          <Text
            as="label"
            size="2"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              id="include-summary"
              checked={fileSummary}
              onCheckedChange={(checked) =>
                handleCheckboxChange('fileSummary', Boolean(checked))
              }
              color="orange"
            />{' '}
            Include File Summary
          </Text>
          <Text
            as="label"
            size="2"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              id="include-dir-structure"
              checked={directoryStructure}
              onCheckedChange={(checked) =>
                handleCheckboxChange('directoryStructure', Boolean(checked))
              }
              color="orange"
            />{' '}
            Include Directory Structure
          </Text>
          <Text
            as="label"
            size="2"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              id="show-line-numbers"
              checked={outputShowLineNumbers}
              onCheckedChange={(checked) =>
                handleCheckboxChange('outputShowLineNumbers', Boolean(checked))
              }
              color="orange"
            />{' '}
            Show Line Numbers
          </Text>
          <Text
            as="label"
            size="2"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              id="output-parsable"
              checked={parsableStyle}
              onCheckedChange={(checked) =>
                handleCheckboxChange('parsableStyle', Boolean(checked))
              }
              color="orange"
            />{' '}
            Output Parsable Format{' '}
            <span
              className="text-[var(--gray-9)] cursor-help"
              title="More information about parsable format"
            >
              (?)
            </span>
          </Text>
        </Flex>

        <Flex direction="column" gap="4" className="md:basis-1/3">
          <Text size="2" weight="medium" className="text-[var(--gray-11)]">
            File Processing Options
          </Text>
          <Text
            as="label"
            size="2"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              id="compress-code"
              checked={compress}
              onCheckedChange={(checked) =>
                handleCheckboxChange('compress', Boolean(checked))
              }
              color="orange"
            />{' '}
            Compress Code
          </Text>
          <Text
            as="label"
            size="2"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              id="remove-comments"
              checked={removeComments}
              onCheckedChange={(checked) =>
                handleCheckboxChange('removeComments', Boolean(checked))
              }
              color="orange"
            />{' '}
            Remove Comments
          </Text>
          <Text
            as="label"
            size="2"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              id="remove-empty-lines"
              checked={removeEmptyLines}
              onCheckedChange={(checked) =>
                handleCheckboxChange('removeEmptyLines', Boolean(checked))
              }
              color="orange"
            />{' '}
            Remove Empty Lines
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
