# Subdomain Finder

A powerful and efficient tool for discovering subdomains of target domains. This tool helps security researchers, penetration testers, and bug bounty hunters enumerate subdomains through multiple discovery techniques.

## Features

- **Multiple Discovery Methods**
  - DNS enumeration using wordlists
  - Certificate Transparency (CT) logs search
  - Search engine scraping
  - DNS zone transfer attempts
  - Brute force with custom wordlists

- **Fast & Efficient**
  - Multi-threaded scanning
  - Async DNS resolution
  - Configurable timeout and retry mechanisms

- **Comprehensive Output**
  - Export results to JSON, CSV, or TXT
  - Live subdomain status checking
  - IP address resolution
  - Optional HTTP/HTTPS probing

## Installation

### Prerequisites

- Python 3.7 or higher
- pip package manager

### Install from source

```bash
git clone https://github.com/yash121l/subdomain-finder.git
cd subdomain-finder
pip install -r requirements.txt
```

### Install via pip

```bash
pip install subdomain-finder
```

## Usage

### Basic Usage

```bash
python subdomain_finder.py -d example.com
```

### Advanced Options

```bash
python subdomain_finder.py -d example.com -w wordlist.txt -t 50 -o results.json
```

### Command Line Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `-d, --domain` | Target domain to enumerate | Required |
| `-w, --wordlist` | Path to wordlist file | built-in list |
| `-t, --threads` | Number of concurrent threads | 25 |
| `-o, --output` | Output file path | stdout |
| `-f, --format` | Output format (json/csv/txt) | txt |
| `--timeout` | DNS timeout in seconds | 3 |
| `--no-check` | Skip subdomain availability check | False |
| `--resolve` | Resolve IP addresses | False |
| `--silent` | Suppress banner and verbose output | False |

### Examples

**Basic enumeration with default wordlist:**
```bash
python subdomain_finder.py -d target.com
```

**Use custom wordlist with 50 threads:**
```bash
python subdomain_finder.py -d target.com -w /path/to/wordlist.txt -t 50
```

**Export results to JSON with IP resolution:**
```bash
python subdomain_finder.py -d target.com --resolve -o results.json -f json
```

**Silent mode for scripting:**
```bash
python subdomain_finder.py -d target.com --silent -o subdomains.txt
```

## Output Formats

### JSON
```json
{
  "domain": "example.com",
  "subdomains": [
    {
      "subdomain": "www.example.com",
      "ip": "93.184.216.34",
      "status": "active"
    }
  ]
}
```

### CSV
```csv
subdomain,ip,status
www.example.com,93.184.216.34,active
mail.example.com,93.184.216.35,active
```

### TXT
```
www.example.com
mail.example.com
ftp.example.com
```

## Wordlists

The tool includes a built-in wordlist for common subdomain names. You can also use custom wordlists:

**Recommended wordlists:**
- [SecLists DNS](https://github.com/danielmiessler/SecLists/tree/master/Discovery/DNS)
- [jhaddix all.txt](https://gist.github.com/jhaddix/86a06c5dc309d08580a018c66354a056)
- [Assetnote wordlists](https://wordlists.assetnote.io/)

## Configuration

Create a `config.yaml` file for persistent settings:

```yaml
threads: 50
timeout: 5
wordlist: /path/to/default/wordlist.txt
output_format: json
resolve_ips: true
```

Load configuration:
```bash
python subdomain_finder.py -d example.com --config config.yaml
```

## API Usage

```python
from subdomain_finder import SubdomainFinder

finder = SubdomainFinder(domain="example.com", threads=25)
subdomains = finder.enumerate()

for subdomain in subdomains:
    print(f"Found: {subdomain}")
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Legal Disclaimer

This tool is provided for educational and ethical testing purposes only. Users are responsible for obtaining proper authorization before scanning any domains they do not own or have explicit permission to test. Unauthorized scanning may be illegal in your jurisdiction.

**Always ensure you have permission before using this tool on any target.**

## Troubleshooting

### Common Issues

**DNS resolution failures:**
- Check your internet connection
- Try using public DNS servers (8.8.8.8, 1.1.1.1)
- Reduce thread count to avoid rate limiting

**Slow scanning:**
- Increase thread count (default: 25)
- Use a smaller, targeted wordlist
- Disable IP resolution if not needed

**No results found:**
- Verify the target domain is correct
- Try a different wordlist
- Check if target has DNS enumeration protection

## Roadmap

- [ ] Integration with additional passive DNS sources
- [ ] Support for wildcard subdomain detection
- [ ] Web interface for easier usage
- [ ] Integration with popular security tools
- [ ] Enhanced reporting with screenshots
- [ ] Docker container support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by tools like Sublist3r, Amass, and Subfinder
- Thanks to the security research community
- Built with Python and love ❤️

## Contact

- **Author**: Yash Lunawat
- **Email**: [Yash's Email](mailto:yashlunawat.tech+SubdomainFinder.com)
- **GitHub**: [yash121l](https://github.com/yash121l)

## Support

If you find this tool useful, please consider:
- Giving it a ⭐ on GitHub
- Reporting bugs and suggesting features
- Contributing to the codebase
- Sharing it with others

---

**Happy Hunting! 🎯**