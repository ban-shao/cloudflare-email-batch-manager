# Cloudflare Email Routing Batch Manager

A Node.js tool for batch managing Cloudflare Email Routing rules. Create and delete hundreds of email forwarding rules with a single command.

## Features

- **Batch Create**: Create multiple email routing rules at once
- **Batch Delete**: Delete rules by name prefix
- **Zero Cost**: Uses Cloudflare's free Email Routing feature
- **Simple API**: Easy-to-use JavaScript functions

## Use Cases

- Create multiple email addresses for service registrations
- Manage temporary email addresses
- Privacy protection with unique email per service
- Bulk email forwarding management

## Prerequisites

- A domain configured with Cloudflare
- Cloudflare Email Routing enabled
- Cloudflare Global API Key
- Node.js 18+

## Installation

```bash
git clone https://github.com/ban-shao/cloudflare-email-batch-manager.git
cd cloudflare-email-batch-manager
```

## Configuration

1. Copy the example config:
```bash
cp config.example.json config.json
```

2. Edit `batch-email-manager.js` and fill in your credentials:

```javascript
const CONFIG = {
  ACCOUNT_ID: 'your_account_id',
  ZONE_ID: 'your_zone_id',
  API_EMAIL: 'your_cloudflare_email',
  API_KEY: 'your_global_api_key',
  DOMAIN: 'your-domain.com',
  DESTINATION_EMAIL: 'destination@gmail.com'
};
```

### How to Get Credentials

1. **Zone ID**: Cloudflare Dashboard → Select Domain → Overview → API section
2. **Account ID**: Cloudflare Dashboard → Overview → API section
3. **Global API Key**: My Profile → API Tokens → Global API Key → View

## Usage

### Add Email Rules

```javascript
import { batchAddRules, generatePrefixes } from './batch-email-manager.js';

// Generate prefixes: user01, user02, ..., user50
const prefixes = generatePrefixes('user', 50, 1);

// Create rules: user01@domain.com → destination@gmail.com
await batchAddRules(prefixes);
```

### Delete Email Rules

```javascript
import { deleteRulesByPrefix } from './batch-email-manager.js';

// Delete all rules with names starting with "Auto-Rule-"
await deleteRulesByPrefix('Auto-Rule-');
```

### Example Scripts

**Add 5 test rules:**
```bash
node test-add-rules.js
```

**Delete all auto-created rules:**
```bash
node test-delete-rules.js
```

## API Reference

### `generatePrefixes(prefix, count, startIndex)`

Generate an array of email prefixes.

| Parameter | Type | Description |
|-----------|------|-------------|
| prefix | string | Base prefix (e.g., 'user') |
| count | number | Number of prefixes to generate |
| startIndex | number | Starting number (default: 1) |

**Returns:** `string[]` - Array of prefixes

**Example:**
```javascript
generatePrefixes('test', 3, 1)
// Returns: ['test1', 'test2', 'test3']

generatePrefixes('user', 5, 10)
// Returns: ['user10', 'user11', 'user12', 'user13', 'user14']
```

### `batchAddRules(emailPrefixes)`

Create email routing rules in batch.

| Parameter | Type | Description |
|-----------|------|-------------|
| emailPrefixes | string[] | Array of email prefixes |

**Returns:** `Promise<Array>` - Results with success/failure status

### `batchDeleteRules(ruleIds)`

Delete email routing rules by IDs.

| Parameter | Type | Description |
|-----------|------|-------------|
| ruleIds | string[] | Array of rule IDs to delete |

**Returns:** `Promise<Array>` - Results with success/failure status

### `deleteRulesByPrefix(namePrefix)`

Delete rules by name prefix.

| Parameter | Type | Description |
|-----------|------|-------------|
| namePrefix | string | Rule name prefix (e.g., 'Auto-Rule-') |

**Returns:** `Promise<Array>` - Results with success/failure status

### `listRoutingRules()`

Get all existing email routing rules.

**Returns:** `Promise<Array>` - Array of rule objects

## Security Notes

- Never commit your API credentials to version control
- Use environment variables for sensitive data in production
- The Global API Key has full account access - keep it secure

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first.
